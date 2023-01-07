# Killcam.GG

This readme serves as a guide for developers to understand the general build and development process of Killcam.GG.

## Getting Started

### Create Your `.env` File

First you will need to create a `.env` file using the `.env.example` file.

#### Twitch Authentication

You will have to add your `TWITCH_CLIENT_ID` and `TWITCH_CLIENT_SECRET` which can be found in the [Twitch Developer Console](https://dev.twitch.tv/console)

You will need to set the OAuth Redirect Url for your Twitch Application to `http://localhost:3000/api/auth/callback/twitch`

#### Discord Authentication

You will have to add your `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET` which can be found in the [Discord Developer Console](https://discord.com/developers/applications)

You will need to set the OAuth Redirect Url for your Discord Application to `http://localhost:3000/api/auth/callback/discord`

### Initialize Database

1. Install [PostgreSQL](https://www.prisma.io/dataguide/postgresql/setting-up-a-local-postgresql-database) on your computer. Set up the default server and database, setting up your own password.
2. Ensure your clone of the code is up-to-date with the "preview" branch. Be sure to pull all commits as you may be missing database migrations.
3. Add your `DATABASE_URL` to the `.env` as the format specified in `.env.example`
4. Run `npx prisma migrate dev` in the terminal to create the database and apply all migrations. This will also run the seed.ts file to pre-populate weapons and attachments.

Altered schemas are automatically handled with the Vercel build process (`postinstall: "prisma generate && prisma migrate deploy"`), which generates and deploys the existing commit migrations.

## Deployment Pipeline

We utilize a form of GitHub Flow with a production branch as well as a staging branch.

- **main** - The primary branch for deployment-ready code. All code merged into this branch will be immediately deployed live by Vercel. This branch is locked, meaning no one can push directly to it.
- **preview** - The branch used for development. All added features and bug fixes will be branched off of this branch. This branch is also locked.
- **preview/\*** - This will be where each feature or bug fix branch will exist. For example, if you were working on a feature to add loadouts, the branch path would be preview/add-loadouts.

Each merge from preview to main will be an incremental update, depending on what has changed.

- 1.0.x - Bug fixes
- 1.x.0 - Feature updates
- x.0.0 - Major projects

Vercel offers automatic preview deployments for every branch that has a pull request made. This includes branches `preview` and `preview/*`.

## Database Management

We utilize [Prisma](https://www.prisma.io/docs/concepts/overview/what-is-prisma) for all database management, including schema changes (migrations) and all data CRUD processes.

Developers will only have access to their own local database, generated by `prisma migrate dev` and seeded with the file `prisma/seed.ts`.

The schema is found in `prisma/schema.prisma`.

### Making a change to the schema

When altering the Prisma schema, it is important to prototype the updated schema by running `npx prisma db push`. This will attempt to update your database. If it fails (due to table/column conflicts), Prisma will inform you of the issues.

Once you get the schema to a stable point, run `npx prisma migrate dev` to create the migration, which is a record of the changes you made. You will be prompted to name the migration, which should be something short and descriptive such as `review_replies_and_likes`.

Note that creating a new migration will reset your database, which will cause you to lose all data (except for the seeded data). Only create the migration when you're 100% positive it will not need any further updates.

When your branch is pulled into the preview/main branches, your database migrations will be applied in the order they were made.

### Resetting the local database

You can run `npx prisma migrate reset` to reset your database to the most recent migration in your `prisma/migrations` folder.

This will:

1. Delete the database.
2. Create a new database with the same name.
3. Apply all migrations in `prisma/migrations`.
4. Run seed script `prisma/seed.ts`.

Note that this does NOT reset your `prisma/schema.prisma` file. You will need to revert this yourself from an earlier commit.
