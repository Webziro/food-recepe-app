# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Configure Supabase

   Copy `.env.example` to `.env` and set your Supabase project URL and anon key. For EAS builds, configure `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` in the EAS environment. Supabase email confirmation must be enabled and configured to send the email verification code.

3. Configure and deploy the backend

   Deploy the `backend` folder and set its environment variables using `backend/.env.example`, including the production PostgreSQL URL, Supabase project URL, and Supabase anon key. Run the existing Drizzle migrations against the production database before release. Configure `EXPO_PUBLIC_API_URL` in the EAS `production` environment to the backend's HTTPS API base URL ending in `/api`. Do not use localhost in a store build.

4. Build and test a Play Store update

   Build an Android App Bundle with `npx eas-cli@latest build --platform android --profile production`. Install and test the result through Play Console internal testing before promoting it to production. Keep the existing Android package name and EAS signing credentials. The production EAS profile auto-increments the Android version code.

5. Start the app against the hosted project

   ```bash
   npx expo start
   ```

## Local Supabase Auth

Local signup can run without email confirmation using an isolated Supabase stack. Start Docker Desktop, then run the Expo web app against it:

```bash
npm run dev:local -- --web
```

The command starts the local stack and launches Expo with its local API URL and anon key. The local auth settings are in `supabase/config.toml`; confirmation is disabled there only. This command does not change `.env`, the hosted Supabase project, or EAS build settings. This localhost URL is intended for web; native emulators and physical devices need a host-reachable Supabase URL instead of `127.0.0.1`.

## Run the Favorites API Locally

The mobile app and Supabase do not start the Express API. Start the API separately in a second terminal or favorites requests to `http://localhost:5001/api` will be refused.

1. Install backend dependencies from the `backend` directory with `npm install`.
2. Create `backend/.env` using `backend/.env.example`. Set `DATABASE_URL` to your Neon PostgreSQL connection string. Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` to the same Supabase project the mobile app is using. To use the local Supabase stack, get its values by running `npx supabase status -o env` from `mobile` and copy `API_URL` and `ANON_KEY` into the backend variables.
3. Start the API with `npm run dev` from `backend`. Keep that terminal running while you use the app.
4. Confirm the API responds at `http://localhost:5001/api/health`, then try saving a favorite again.

Use `npx supabase stop` from the `mobile` directory to stop the local stack.

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
