const { spawn, spawnSync } = require("node:child_process");

const mobileRoot = process.cwd();
const supabaseCli = `${mobileRoot}/node_modules/supabase/dist/supabase.js`;

function runSupabase(args, inheritOutput = false) {
  const result = spawnSync(process.execPath, [supabaseCli, ...args], {
    cwd: mobileRoot,
    encoding: inheritOutput ? undefined : "utf8",
    stdio: inheritOutput ? "inherit" : "pipe",
  });

  if (result.error) {
    throw new Error("Supabase CLI is required. Install it and start Docker Desktop.");
  }

  if (result.status !== 0) {
    const details = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
    throw new Error(details || `supabase ${args.join(" ")} failed.`);
  }

  return result.stdout || "";
}

function parseEnv(output) {
  return Object.fromEntries(
    output.split(/\r?\n/).flatMap((line) => {
      const match = line.match(/^(?:export\s+)?([A-Z_]+)=(.*)$/);
      if (!match) return [];

      const [, name, rawValue] = match;
      let value = rawValue.trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = JSON.parse(value);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }

      return [[name, value]];
    }),
  );
}

try {
  console.log("Starting the local Supabase stack...");
  runSupabase(["--workdir", mobileRoot, "start"], true);

  const localConfig = parseEnv(
    runSupabase(["--workdir", mobileRoot, "status", "-o", "env"]),
  );
  if (!localConfig.API_URL || !localConfig.ANON_KEY) {
    throw new Error("Supabase CLI did not return API_URL and ANON_KEY.");
  }

  const expoCli = `${mobileRoot}/node_modules/expo/bin/cli`;
  const expo = spawn(process.execPath, [expoCli, "start", ...process.argv.slice(2)], {
    cwd: mobileRoot,
    env: {
      ...process.env,
      EXPO_PUBLIC_SUPABASE_URL: localConfig.API_URL,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: localConfig.ANON_KEY,
    },
    stdio: "inherit",
  });

  expo.on("error", (error) => {
    console.error(`Could not start Expo: ${error.message}`);
    process.exitCode = 1;
  });
  expo.on("close", (code) => {
    process.exitCode = code ?? 1;
  });
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}