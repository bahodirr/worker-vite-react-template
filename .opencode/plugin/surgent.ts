import { type Plugin, tool } from "@opencode-ai/plugin"
import { z } from "zod"

type SurgentConfig = {
  name?: string
  scripts?: {
    dev?: string | string[]
    lint?: string | string[]
  }
}

export const SurgentDeployPlugin: Plugin = async ({ $, directory }) => {
  $.cwd(directory)

  async function readJSONIfExists(path: string) {
    try {
      return await $`cat ${path}`.json()
    } catch {
      return undefined
    } 
  }

  function toArray<T>(value: T | T[]): T[] {
    return Array.isArray(value) ? value : [value]
  }

  async function pm2JList(): Promise<any[]> {
    try {
      return await $`pm2 jlist`.json()
    } catch {
      return []
    }
  }

  async function isPm2Online(name: string): Promise<boolean> {
    const list = await pm2JList()
    const proc = list.find((p: any) => p?.name === name)
    const status = proc?.pm2_env?.status
    return status === "online"
  }

  async function startOrRestartPm2Process(name: string, command: string): Promise<string> {
    const online = await isPm2Online(name)
    if (online) {
      return `already online ${name}`
    }
    await $`${{ raw: `pm2 start "${command}" --name ${name}` }}`
    return `started ${name}`
  }

  function getNameFromSurgent(cfg: SurgentConfig | undefined): string {
    const direct = cfg?.name?.trim()
    if (!direct) throw new Error('Missing "name" in surgent.json')
    return direct
  }

  async function convexChanged(): Promise<boolean> {
    try {
      const out = await $`git status --porcelain convex/`.text()
      return out.trim().length > 0
    } catch {
      // If git is unavailable, assume changed to be safe
      return true
    }
  }

  async function runDev(): Promise<string> {
    const cfg: SurgentConfig = await readJSONIfExists(`${directory}/surgent.json`)
    const dev = cfg?.scripts?.dev
    if (!dev) throw new Error('Missing "scripts.dev" in surgent.json')
    const changed = await convexChanged()
    const steps: string[] = []


    // Run pipeline: codegen → lint → deploy
    if (changed) {
      await $`bun run convex:codegen`
      steps.push("Ran convex:codegen")
    } else {
      steps.push("Skipped convex:codegen")
    }
    await $`bun run lint`
    steps.push("Ran full lint")
    if (changed) {
      await $`bun run convex:once`
      steps.push("Ran convex dev to sync changes")
    } else {
      steps.push("Skipped convex sync as no changes")
    }

    // Restart PM2 dev server
    const commands = Array.isArray(dev) ? dev : [dev]
    const configuredName = getNameFromSurgent(cfg)
    for (let i = 0; i < commands.length; i++) {
      const name = commands.length > 1 ? `${configuredName}:${i + 1}` : configuredName
      const action = await startOrRestartPm2Process(name, commands[i])
      steps.push(`PM2 ${action}`)
    }
    steps.push("Done")
    return steps.join("\n")
  }

  // Simple: rely on pm2 to fetch logs directly

  return {
    tool: {
      "dev": tool({
        description: "Ensures the development server is running. Syncs convex if needed and runs lint.",
        args: {},
        async execute(): Promise<string> {
          try {
            const result = await runDev()
            return result
          } catch (error) {
            const err = error as Error
            return `Failed error message: ${err.message}\n${err.stack?.toString()}`
          }
        },
      }),
      "devLogs": tool({
        description: "Show the last N lines of dev server PM2 logs using pm2 logs. Args: lines (default 20) to specify the number of lines to show.",
        args: { lines: z.number().default(20) },
        async execute(args): Promise<string> {
          try {
            const cfg: SurgentConfig = await readJSONIfExists(`${directory}/surgent.json`)
            const name = getNameFromSurgent(cfg) as string
            const out = await $`pm2 logs ${name} --lines ${args.lines} --nostream`.text()
            return out
          } catch (error) {
            return `Log fetch failed: ${(error as Error).message} JSON: ${JSON.stringify(error)}`
          }
        },
      }),
    },
  }
}

