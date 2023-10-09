import axios from "axios";
import * as cheerio from "cheerio";
import express from "express";
import cors from "cors";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";

const PORT = 8000;
const app = express();
const baseUrl = "https://www.serebii.net";
const dishesUrl = "https://www.serebii.net/pokemonsleep/dishes.shtml";
const ingredientsUrl = "https://www.serebii.net/pokemonsleep/ingredients.shtml";

app.use(cors());
app.use(express.static("./assets"));

const getRecipe = (list) => {
    const format = list.replace(" *", "");
    const quantityReg = new RegExp(/[0-9]+/g);
    const nameReg = new RegExp(/[A-z]+\s*[A-z]+/g);

    const quantities = [...format.matchAll(quantityReg)];
    const names = [...format.matchAll(nameReg)];
    const recipe = names.map((name, index) => {
        return {
            name: name[0],
            quantity: quantities[index][0],
        };
    });
    return recipe;
};

const scrapRecipes = async () => {
    const htmlResult = await axios.get(dishesUrl);
    // HTML Loaded from website
    const $ = cheerio.load(htmlResult.data);

    // Get recipe titles from <h2> except the first h2
    const $titles = $("h2:not(:first)");
    const dishes = [];
    // For each title get the recipes
    $titles.each(function (index, element) {
        const $dishes = $(`tbody:eq(${index + 2}) > tr:not(:first)`);
        dishes.push({
            title: $(element).text().split(" ")[2],
            recipes: $dishes
                .map(function (i, el) {
                    const dishe = {};
                    // Name
                    dishe.name = $(this).find("td:eq(1)").text();
                    if (dishe.name === "Name") return;

                    // Source Image
                    const imageSrc = $(this).find("td:eq(0) > a > img").attr("src");
                    dishe.imageSrc = baseUrl + imageSrc;

                    // Description
                    const description = $(this).find("td:eq(2)").text();
                    if (!description) {
                        dishe.description = $(this).find("td:eq(3)").text();

                        return dishe;
                    }
                    dishe.description = description;

                    // Ingredients name and quantities
                    const ingredientsName = $(this).find("td:eq(3)").text();
                    const ingredients = getRecipe(ingredientsName);
                    dishe.ingredients = ingredients;
                    return dishe;
                })
                .toArray(),
        });
        // console.log(dishes);
        writeFileSync("./data/recipes.json", JSON.stringify(dishes));
    });
};

const scrapBerries = async () => {
    const htmlResult = await axios.get(ingredientsUrl);
    const $ = cheerio.load(htmlResult.data);

    const $berryTable = $("tbody:eq(1) > tr:not(:first)");
    const berries = $berryTable
        .map(function (index, element) {
            const berry = {};
            berry.name = $(this).find("td:eq(1)").text();
            berry.imageSrc = baseUrl + $(this).find("td:eq(0) > a > img").attr("src");
            berry.description = $(this).find("td:eq(2)").text();

            return berry;
        })
        .toArray();
    console.log(berries);
    writeFileSync("./data/berries.json", JSON.stringify(berries));
};

const scrapIngredients = async () => {
    const htmlResult = await axios.get(ingredientsUrl);
    const $ = cheerio.load(htmlResult.data);

    const $ingredientTable = $("tbody:eq(2) > tr:not(:first)");
    const ingredients = $ingredientTable
        .map(function (index, element) {
            const ingredient = {};
            ingredient.name = $(this).find("td:eq(1)").text();
            ingredient.imageSrc = baseUrl + $(this).find("td:eq(0) > a > img").attr("src");
            ingredient.description = $(this).find("td:eq(2)").text();
            ingredient.baseStrength = Number.parseInt($(this).find("td:eq(3)").text());
            ingredient.sellValue = Number.parseInt($(this).find("td:eq(4)").text().split(" ")[0]);
            return ingredient;
        })
        .toArray();
    console.log(ingredients);
    writeFileSync("./data/ingredients.json", JSON.stringify(ingredients));
};

const fetchImages = (items, directory) => {
    items.forEach(async (item) => {
        try {
            const response = await axios.get(item.imageSrc, {
                responseType: "arraybuffer",
            });
            const imageBuffer = Buffer.from(response.data, "binary");
            const fileName = item.name.replaceAll(" ", "-").toLowerCase();

            if (!existsSync(`./assets/images/${directory}`)) {
                mkdirSync(`./assets/images/${directory}`, { recursive: true });
            }
            writeFileSync(`./assets/images/${directory}/${fileName}.png`, imageBuffer);
        } catch (error) {
            console.log(`Error downloading ${item.name}`, error.message);
        }
    });
};

const downloadImages = (pathName, folderName = "") => {
    const content = readFileSync(pathName);
    const items = JSON.parse(content);

    if (!folderName) {
        items.forEach((dishe) => {
            const directory = dishe.title.toLowerCase();
            fetchImages(dishe.recipes, directory);
        });
    }
    fetchImages(items, folderName);
    console.log(`Images ${pathName} downloaded`);
};

app.get("/", async (req, res) => {
    console.log("get request requested");
    const bufferRecipes = readFileSync("./data/recipes.json");
    const recipes = JSON.parse(bufferRecipes);
    res.send(recipes);
});

app.listen(PORT, () => {
    console.log(`Server started on port http://localhost:${PORT}/`);
    // scrapRecipes();
    // scrapBerries();
    // scrapIngredients();
    // downloadImages("./data/recipes.json");
    // downloadImages("./data/berries.json", "berry");
    // downloadImages("./data/ingredients.json", "ingredient");
});
