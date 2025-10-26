import { type Plugin, tool } from "@opencode-ai/plugin"

type SurgentConfig = {
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

  async function runMany(commands: string | string[]) {
    for (const cmd of toArray(commands)) {
      await $`${{ raw: cmd }}`
    }
  }

  async function runDev() {
    const cfg: SurgentConfig = await readJSONIfExists(`${directory}/surgent.json`)
    const dev = cfg?.scripts?.dev
    if (!dev) throw new Error('Missing "scripts.dev" in surgent.json')
    await runMany(dev)
    return { ok: true }
  }

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
    },
  }
}

