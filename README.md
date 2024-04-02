# Crisp O'quent - NuxtJS

In this project, an API client has been created using TypeScript and JavaScript. This client includes a series of classes and tools used to fetch data from the API.

## Features

- `CrispOquentConfig`: This class contains the base URI of the API and other general settings.
- `Builder`: This class is a query builder used to fetch data from the API. You can create queries with methods like `where` and `orderBy`, and paginate the results with the `paginate` method.
- `PaginatedResults`: This class represents the paginated results returned from the API. It includes information such as the total number of results, the current page number, and the number of results per page.

## Getting Started

Follow the steps below to run this project on your local machine.

### Prerequisites

You need to have Node.js and npm installed to run this project.

### Nuxt-Js Installation + Customization

```bash
$ npm i crisp-oquent
```

### Development

```js
import {CrispOquent} from "@crisp-oquent";

export default defineNuxtPlugin((nuxtApp) => {
    CrispOquent.initialize(
        {
            baseUri: 'https://bir-tan.com',
        }
    );
});
```

#### To Be Continued, wanna participate?
