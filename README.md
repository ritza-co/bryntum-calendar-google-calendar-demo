# Deploy a Bryntum Calendar with Google Authentication synced to Google Calendar 

The code for the complete app, ready for deployment, is on the `completed-calendar` branch.

## Getting started

Install the dependencies by running the following command: 

```sh
npm install
```

## Adding your Google Project Client ID to an environmental variable

Create an `.env` file in the root folder and save your Google project's OAuth **Client ID** as an environmental variable called `VITE_GOOGLE_CLIENT_ID`:

```
VITE_GOOGLE_CLIENT_ID=<your-client-id>
```

Your Google project will need to have the "../auth/calendar.events" scope added.

## Installing the Bryntum Calendar React component

First, follow the [guide to accessing the Bryntum npm repository](https://bryntum.com/products/calendar/docs/guide/Calendar/npm-repository). Once you’ve logged in to the registry, install the Bryntum Calendar packages.

- If you’re using the trial version, use the following command:

  ```sh
  npm install @bryntum/calendar@npm:@bryntum/calendar-trial @bryntum/calendar-react
  ```

- If you’re using the licensed version, use the following command:

  ```sh
  npm install @bryntum/calendar @bryntum/calendar-react
  ```

## Running the app

Run the local dev server using the following command:

```sh
npm run dev
```

Open http://localhost:5173, and login using your Google account. You'll see your Google calendar events displayed in the Bryntum Calendar:

![Initial app](./src/assets/initial-app.png)
