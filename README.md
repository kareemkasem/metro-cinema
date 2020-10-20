## Metro Cinema

a website to create and manage movies for a cinema and book tickets.

## Admin features

- all CRUD operations.

- pin movie.

- hide movie.

- movies that are past limit will automatically hide for users.

## User Features

- book ticket.

- track bookings.

## Technical features:

- User Authentication.

- Admin Authentication.

- Full movies management system.

- static file serving.

- create pdf tickets.

## Main Technologies Used:

- nodeJS
- Express
- Ejs Templating Engine.
- Bootstrap
- SendGrid mail service.
- MongoDB and mongoose.

## notes:

- this app was NOT meant to scale.

- this app is made to practice nodejs. It's not a production ready product and some adjustments (like payments and another companion solution for tickets) will be needed.

- this app requires some environment variables in a `nodemon.json` file as follows:
  `{ "env": { "MONGO_URI": MY_URI, "SESSION_SECRET": MY_SECRET, "SENDGRID_API_KEY": SEND_GRID_KEY, "ADMIN_EMAIL": SEND_GRID_EMAIL, "PORT": PORT } }`

## Todos

1. host static files on a service like Amazon S3.
2. build a companion app for tickets.
3. add payment method.
4. add Auditorium selection capability.
5. add checking for date and Auditorium movie conflicts.
