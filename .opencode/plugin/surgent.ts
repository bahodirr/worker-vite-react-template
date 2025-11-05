import { type Plugin, tool } from "@opencode-ai/plugin"

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

  async function ensurePm2Process(name: string, command: string) {
    const online = await isPm2Online(name)
    if (online) return
    await $`${{ raw: `pm2 start "${command}" --name ${name}` }}`
  }

  function getNameFromSurgent(cfg: SurgentConfig | undefined): string | undefined {
    const direct = cfg?.name?.trim()
    if (!direct) throw new Error('Missing "name" in surgent.json')
    return direct
  }

  // Dev pipeline moved to package.json dev script; plugin only ensures process.

  async function runDev() {
    const cfg: SurgentConfig = await readJSONIfExists(`${directory}/surgent.json`)
    const dev = cfg?.scripts?.dev
    if (!dev) throw new Error('Missing "scripts.dev" in surgent.json')
    // Pipeline now runs inside package.json's dev command.
    const commands = toArray(dev)
    const configuredName = getNameFromSurgent(cfg)
    const baseName = configuredName
    for (let i = 0; i < commands.length; i++) {
      const name = commands.length > 1 ? `${baseName}:${i + 1}` : baseName
      await ensurePm2Process(name as string, commands[i])
    }
    return { ok: true }
  }

  // Simple: rely on pm2 to fetch logs directly

  return {
    tool: {
      // "devDeploy": tool({
      //   description: "Run development deploy commands from surgent.json (no args). Always after updating the codebase.",
      //   args: {},
      //   async execute(): Promise<string> {
      //     try {
      //       await deployOnce()
      //       return "Deployed successfully"
      //     } catch (error) {
      //       return `Deploy failed: ${(error as Error).message} JSON: ${JSON.stringify(error)}`
      //     }
      //   },
      // }),
      "dev": tool({
        description: "Run the development vite server, Always run this after updating the codebase.",
        args: {},
        async execute(): Promise<string> {
          try {
            await runDev()
            return "Deployed successfully"
          } catch (error) {
            return `Deploy failed: ${(error as Error).message} JSON: ${JSON.stringify(error)}`
          }
        },
      }),
      "devLogs": tool({
        description: "Show the last 200 lines of dev server PM2 logs using pm2 logs.",
        args: {},
        async execute(): Promise<string> {
          try {
            const cfg: SurgentConfig = await readJSONIfExists(`${directory}/surgent.json`)
            const name = getNameFromSurgent(cfg) as string
            const out = await $`pm2 logs ${name} --lines 200 --nostream`.text()
            return out
          } catch (error) {
            return `Log fetch failed: ${(error as Error).message} JSON: ${JSON.stringify(error)}`
          }
        },
      }),
    },
  }
}

