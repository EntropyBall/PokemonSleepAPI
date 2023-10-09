# Pokemon sleep API
Pokémon Sleep API allows you to get all the recipes, ingredients and berries from the game, including images.

### Table of content:
1. Scrapper
2. Server
3. Routes
4. Architecture
5. Design

## Scrapper
- Scrap serebii.net to extract data and images url.

## Server
- Download all dishes, berries and ingredients images.
- Download all dishes, berries and ingredients images.
- Save scrapped data in json format.
- Persists data in MongoDB (_WIP_).

## Routes
- _/recipes/_: get all recipes
- _/recipes/salads/_: get all salades recipes _WIP_
- _/recipes/curry/_: get all curry recipes _WIP_
- _/recipes/desserts/_: get all desserts recipes _WIP_
- _/ingredients/_: get all ingredients _WIP_
- _/images/\*/\*.png_: get any images from server

## Architecture
API Server: Node.js  
API Route: express.js _WIP_  
Web scrapper: cheerio.js [Docs](https://cheerio.js.org/docs/api)  
Database: MongoDB _WIP_  