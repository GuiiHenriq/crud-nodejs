🚀 Production-Ready Node.js API Showcase
========================================

This project is a showcase of a professional, production-ready Node.js API, it's designed to be strong, secure, and easy to monitor, just like a real-world application.
I built this project to demonstrate a complete backend workflow, from the first idea to a fully containerized and tested service.

* * * * *

✨ Key Features
--------------

This project includes many professional features:

-   **🏗️ Modular Monolith Architecture:** A smart and practical design that isn't a complex microservice but is more powerful than a simple monolith.

-   **📨 Asynchronous Processing:** Uses **RabbitMQ** to send a "welcome notification" in the background. This means the API stays fast and responsive.

-   **📊 Full Observability:** Integrated with **Datadog** to monitor logs, application performance (APM), and traces.

-   **🐳 Fully Containerized:** The entire application (API, worker, and database) runs with a single command using **Docker Compose**.

-   **🧪 Deeply Tested:** Includes both Unit and Integration tests using **Jest** and **Supertest**.

-   **🔒 Security First:** Uses `helmet` for security headers and `express-rate-limit` to prevent abuse.

-   **🤖 Automated CI/CD:** A **GitHub Actions** pipeline automatically runs all tests and lints the code on every push.

-   **💅 Clean Code:** Enforces a strict and consistent code style using **ESLint** and **Prettier**.

* * * * *

🏛️ A Note on the Architecture
------------------------------

This project is a **"Modular Monolith"**. This is a practical design choice that fits between a simple monolith and a complex microservice system.

Here is how it works:

1.  A client (like a web app) sends a `POST /api/users` request to create a new user.

2.  The **API Service** (Container 1) validates the data, saves the user to the **PostgreSQL Database**, and immediately sends a "success" response back to the client.

3.  At the same time, the API publishes a `USER_CREATED` message to a **RabbitMQ** queue.

4.  A separate, independent **Consumer Service** (Container 2) is always listening to that queue. It receives the message and handles the "slow" work of sending a welcome notification (simulated in this project).

This design means the user gets a fast API response, and the slow work (like sending an email) happens in the background. If the notification service fails, it does not stop the user from being created.

### Diagram

```
graph TD
    subgraph "Client"
        A[User's Browser/App]
    end

    subgraph "Our System (Docker Compose)"
        A -- 1. HTTP Request (POST /api/users) --> B{API Service (Node.js/Express)};

        B -- 2. Save User --> D[(PostgreSQL DB)];
        B -- 3. Send "Success" --> A;
        B -- 4. Publish Event --> R((RabbitMQ));

        R -- 5. Consume Event --> C[Consumer Service (Node.js)];
        C -- 6. "Send Welcome Email" --> E[Log Output];
    end

    subgraph "External Services"
        B -- Sends Traces/Logs --> DD(Datadog);
        C -- Sends Traces/Logs --> DD;
        R -- (Hosted on CloudAMQP) --> R;
    end
```

* * * * *

💻 Tech Stack
-------------

-   **Backend:** Node.js, Express.js, TypeScript

-   **Database:** PostgreSQL, Prisma (ORM)

-   **Messaging:** RabbitMQ (with CloudAMQP)

-   **Observability:** Datadog

-   **Containerization:** Docker

-   **Testing:** Jest, Supertest

-   **CI/CD:** GitHub Actions

-   **Code Style:** ESLint, Prettier

* * * * *

🚀 Getting Started
------------------

You only need Git and Docker Desktop to run this entire project. The database, API, and worker will all start together.

**1\. Clone the repository:**

```
git clone https://github.com/GuiiHenriq/crud-nodejs
cd crud-nodejs
```

**2\. Create your environment file:** Copy the example file.

```
cp .env.example .env
```

**3\. Edit the `.env` file:** You must fill in the following values. The other values are already set for Docker.

-   `AMQP_URL`: Get this from a free [CloudAMQP](https://www.cloudamqp.com/) instance.

-   `DATADOG_API_KEY`: Get this from your [Datadog](https://www.datadoghq.com/) free tier account.

**4\. Run with Docker Compose:** This command will build your application's image and start all three services.


```
docker-compose up --build
```

That's it!

-   The **API** is now running on `http://localhost:3000`.

-   The **Database** is running on `localhost:5432`.

-   The **Consumer** is running in the background.

You can now use a tool like Postman to send a `POST` request to `http://localhost:3000/api/users` with the following JSON body:

JSON

```
{
  "name": "My Test User",
  "email": "test@example.com"
}
```

* * * * *

🧪 Running the Tests
--------------------

This project is configured to run tests against a temporary test database using GitHub Actions. To run the tests locally, you can use the `npm test` command.

```
# Install dependencies
npm install

# Run all unit and integration tests
npm test
```