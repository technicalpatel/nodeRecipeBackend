const recipe = require('../model/recipe.model');
const DataBaseConnection = require('../connection/connection');
const fs = require('fs');
recipeController = {};
// const recipeUtil = require('../utils/recipeUtils');

// Validation Recipe And Add Recipe
recipeController.addRecipe = async function (body, auth_token, recipeImageFileNames, callback) {
    try {
        // recipeImageFileNames
        // [0] = NAME  [1]=mimetype [2]=size [3]=fullImage

        let recipe_image_name = Date.now() + "-" + recipeImageFileNames[0];
        recipeImageFileNames[3].mv('public/recipeimages/' + recipe_image_name);
        try {
            let sqlUserID = `SELECT user_id from user where user_authtoken='${auth_token}'`;
            await DataBaseConnection.query(sqlUserID, async function (error, result) {
                recipe.recipe_name = body.recipe_name.trim().toLowerCase();
                recipe.type_id = Number(body.type_id);
                recipe.recipe_level = body.recipe_level.trim().toLowerCase();
                recipe.recipe_cookingtime = Number(body.recipe_cookingtime);
                recipe.recipe_ingredients = body.recipe_ingredients;
                recipe.recipe_steps = body.recipe_steps;
                recipe.recipe_people = Number(body.recipe_people);
                recipe.recipe_image = recipe_image_name;
                recipe.user_id = result[0].user_id;
                recipe.recipe_description = body.recipe_description.toLowerCase();

                let recipeValue = [recipe.recipe_name, recipe.type_id, recipe.recipe_level, recipe.recipe_cookingtime, recipe.recipe_ingredients, recipe.recipe_steps, recipe.recipe_people, recipe.recipe_image, recipe.user_id, recipe.recipe_description];

                await DataBaseConnection.query("INSERT INTO recipes (recipe_name,type_id,recipe_level,recipe_cookingtime,recipe_ingredients,recipe_steps,recipe_people,recipe_image,user_id,recipe_description) VALUES  (?)",
                    [recipeValue], function (error, rows) {
                        if (!error) {
                            return callback(data = { status: "OK", message: "RECIPE ADDED" });
                        } else {
                            return callback(data = { status: "ERROR", message: "RECIPE NOT ADDED" });
                        }
                    });
            });
        } catch (error) {
            return callback(data = { status: "ERROR", message: "RECIPE NOT ADDED" });
        }
        // await recipeUtil.addRecipe(body, auth_token,recipe_image_name,async function (data) {
        //     return callback(data);
        // });

    } catch (error) {
        return callback({ status: "ERROR", message: "Recipe Controller Validation Error" });
    }
}

// Validation Recipe And Edit Recipe
recipeController.editRecipe = async function (body, recipeImageFileNames, callback) {
    // [0] = NAME  [1]=mimetype [2]=size [3]=fullImage
    let recipe_image_name = Date.now() + "-" + recipeImageFileNames[0];
    try {
        recipe.recipe_name = body.recipe_name.trim().toLowerCase();
        recipe.type_id = Number(body.type_id);
        recipe.recipe_level = body.recipe_level.trim().toLowerCase();
        recipe.recipe_cookingtime = Number(body.recipe_cookingtime);
        recipe.recipe_ingredients = body.recipe_ingredients;
        recipe.recipe_steps = body.recipe_steps;
        recipe.recipe_people = Number(body.recipe_people);
        recipe.recipe_image = recipe_image_name;
        recipe.recipe_description = body.recipe_description.trim().toLowerCase();
        let recipe_id = body.recipe_id;

        if (!isNaN(recipe_id) && recipe_id !== "") {
            let sqlRecipeID = `SELECT recipe_image FROM recipes WHERE recipe_id=${Number(body.recipe_id)}`;
            await DataBaseConnection.query(sqlRecipeID, async function (error, result) {
                let recipeOldImage = result[0].recipe_image;
                try {
                    // Old image user remove in folder
                    fs.unlinkSync('public/recipeimages/' + recipeOldImage);
                } catch (error) {
                }
                // User new Edit Image Uploaded
                recipeImageFileNames[3].mv('public/recipeimages/' + recipe.recipe_image);

                let value = [recipe.recipe_name, recipe.type_id, recipe.recipe_level, recipe.recipe_cookingtime, recipe.recipe_ingredients, recipe.recipe_steps, recipe.recipe_people, recipe.recipe_image, recipe.recipe_description, recipe_id];
                let sqlQuery = "UPDATE recipes SET recipe_name=? ,type_id=? ,recipe_level=? ,recipe_cookingtime=? ,recipe_ingredients=? ,recipe_steps=? ,recipe_people=? ,recipe_image=?,recipe_description=? where recipe_id=?";

                await DataBaseConnection.query(sqlQuery, value, function (error, result) {
                    if (!error) {
                        if (result.affectedRows == 1) {
                            return callback(data = { status: "OK", message: "RECIPE EDITED SUCCESSFULLY" });
                        } else {
                            return callback(data = { status: "ERROR", message: "RECIPE NOT EXISTED" });
                        }
                    }
                });
            });
        } else {
            return callback(data = { status: "ERROR", message: "RECIPE ID IS NOT GET " });
        }
    } catch (error) {
        return callback(data = { status: "ERROR", message: "RECIPE NOT EDITED" });
    }
    // data = await recipeUtil.editRecipe(body, recipe_image_name, recipeImageFileNames[3], function (data) {
    //     return callback(data);
    // });
}

// Recipe Delete
recipeController.recipeDelete = async function (id, callback) {
    try {
        let sqlImageDelete = `SELECT recipe_image FROM recipes WHERE recipe_id=${id}`;
        await DataBaseConnection.query(sqlImageDelete, async function (error, result) {
            try {
                // remove recipe and recipe image
                try {
                    fs.unlinkSync('public/recipeimages/' + result[0].recipe_image);
                } catch (error) {
                }

                let sqlQuery = `delete from recipes where recipe_id=${id}`;
                await DataBaseConnection.query(sqlQuery, function (error, result) {
                    if (!error) {
                        if (result.affectedRows == 1) {
                            return callback(data = { status: "OK", message: "RECIPE DELETED" });
                        } else {
                            return callback(data = { status: "ERROR", message: "RECIPE IS NOT EXISTING" });
                        }
                    }
                });

            } catch (error) {
                return callback({ status: "ERROR", message: "Recipe Controller RecipeDelete Error" });
            }
        });
        // await recipeUtil.deleteRecipe(id, function (data) {
        //     return callback(data);
        // });
    } catch (error) {
        return callback({ status: "ERROR", message: "Recipe Controller RecipeDelete Error" });
    }
}

// All Recipes Gets (with user login or not login)
recipeController.recipesGets = async function (count, user, callback) {
    try {
        if (user[0]) {
            let sqlQuery = `SELECT COUNT(f.recipe_id) AS favoriteCount,
            COUNT(DISTINCT fr.recipe_id) AS recipeLike,
            r.recipe_id,
            rt.type_name,
            r.recipe_name,
            r.recipe_level,
            r.recipe_people,
            r.recipe_cookingtime,
            r.recipe_image,
            r.recipe_description
            FROM recipes r
            LEFT JOIN recipe_type rt ON r.type_id=rt.type_id
            LEFT JOIN favorite f ON f.recipe_id=r.recipe_id 
            LEFT JOIN favorite fr ON r.recipe_id=fr.recipe_id AND fr.user_id=${user[1]}
            GROUP BY r.recipe_id
            ORDER BY r.recipe_id DESC LIMIT ${count},10`;

            await DataBaseConnection.query(sqlQuery, function (error, result) {
                if (!error) {
                    if (result.length == 0) {
                        return callback(data = { status: "ERROR", message: "Recipe Not Exists" });
                    } else {
                        return callback(data = { status: "OK", message: "", recipes: result });
                    }
                } else {
                    return callback(data = { status: "ERROR", message: "Recipes Not Get" });
                }
            });


            // let sqlQuery = `SELECT COUNT(f.recipe_id) AS favoriteCount,	    
            // r.recipe_id,
            // rt.type_name,
            // r.recipe_name,
            // r.recipe_level,
            // r.recipe_people,
            // r.recipe_cookingtime,
            // r.recipe_image,
            // r.recipe_description
            // FROM recipes r
            // LEFT JOIN recipe_type rt ON r.type_id=rt.type_id
            // LEFT JOIN favorite f ON f.recipe_id=r.recipe_id 
            // GROUP BY r.recipe_id  ORDER BY r.recipe_id DESC LIMIT ${count},10`;
            // await DataBaseConnection.query(sqlQuery, async function (error, resultOuter) {
            //     if (!error) {
            //         let sqlQuery = `SELECT COUNT(f.recipe_id) AS recipeLike 
            //         FROM recipes r
            //         LEFT JOIN favorite f ON f.recipe_id=r.recipe_id AND f.user_id=${user[1]}
            //         GROUP BY r.recipe_id ORDER BY r.recipe_id DESC LIMIT ${count},10`;

            //         await DataBaseConnection.query(sqlQuery, function (error, result) {
            //             resultOuter.map((item, i) => {
            //                 resultOuter[i].recipeLike = result[i].recipeLike;
            //             });
            //             return callback(data = { status: "OK", message: "", recipes: resultOuter });
            //         });
            //     } else {
            //         return callback(data = { status: "ERROR", message: "Please Pass a Count Data" });
            //     }
            // });
        } else {
            let sqlQuery = `SELECT COUNT(f.recipe_id) AS favoriteCount,
            r.recipe_id,
            rt.type_name,
            r.recipe_name,
            r.recipe_level,
            r.recipe_people,
            r.recipe_cookingtime,
            r.recipe_image,
            r.recipe_description
            FROM recipes r
            LEFT JOIN recipe_type rt ON r.type_id=rt.type_id
            LEFT JOIN favorite f ON r.recipe_id=f.recipe_id
            GROUP BY r.recipe_id ORDER BY r.recipe_id DESC LIMIT ${count},10`;
            await DataBaseConnection.query(sqlQuery, function (error, result) {
                if (!error) {
                    if (result.length == 0) {
                        return callback(data = { status: "ERROR", message: "Recipe Not Exists" });
                    } else {
                        return callback(data = { status: "OK", message: "", recipes: result });
                    }
                } else {
                    return callback(data = { status: "ERROR", message: "Please Pass a Count Data" });
                }
            });
        }
        // await recipeUtil.getRecipes(Number(count), user, function (data) {
        //     return callback(data);
        // });
    } catch (error) {
        return callback({ status: "ERROR", message: "Recipe Controller All Recipe Gets Error" });
    }

}

// single recipes get(with user login or not login)
recipeController.recipeGet = async function (id, user, callback) {
    try {
        if (user[0]) {

            let sqlQuery = `SELECT COUNT(f.recipe_id) AS favoriteCount,COUNT(DISTINCT fr.recipe_id) AS recipeLike,
                (SELECT COUNT(*) FROM recipes WHERE recipe_id=${id} AND user_id=${user[1]}) AS userRecipe,
                r.recipe_id,
                rt.type_name,
                r.recipe_name,
                r.recipe_level,
                r.recipe_people,
                r.recipe_cookingtime,
                r.recipe_image,
                r.recipe_ingredients,
                r.recipe_steps,
                r.recipe_description
                FROM recipes r
                LEFT JOIN recipe_type rt ON r.type_id=rt.type_id
                LEFT JOIN favorite f ON f.recipe_id=r.recipe_id 
                LEFT JOIN favorite fr ON r.recipe_id=fr.recipe_id AND fr.user_id=${user[1]}
                GROUP BY r.recipe_id
                HAVING r.recipe_id=${id}
                ORDER BY r.recipe_id DESC`;

            // let sqlQuery=`SELECT COUNT(f.recipe_id) AS favoriteCount,COUNT(DISTINCT fr.recipe_id) AS recipeLike,
            // r.recipe_id,
            // rt.type_name,
            // r.recipe_name,
            // r.recipe_level,
            // r.recipe_people,
            // r.recipe_cookingtime,
            // r.recipe_image,
            // r.recipe_ingredients,
            // r.recipe_steps,
            // r.recipe_description
            // FROM recipes r
            // LEFT JOIN recipe_type rt ON r.type_id=rt.type_id
            // LEFT JOIN favorite f ON f.recipe_id=r.recipe_id 
            // LEFT JOIN favorite fr ON r.recipe_id=fr.recipe_id AND fr.user_id=${user[1]}
            // GROUP BY r.recipe_id
            // HAVING r.recipe_id=${id}
            // ORDER BY r.recipe_id DESC`;

            await DataBaseConnection.query(sqlQuery, function (error, result) {
                if (!error) {
                    if (result.length == 0) {
                        return callback(data = { status: "ERROR", message: "Recipe not exists" });
                    } else {
                        return callback(data = { status: "OK", message: "", recipe: result[0] });
                    }
                } else {
                    return callback(data = { status: "ERROR", message: "Recipe not exists" });
                }
            });


            // let sqlQuery = `SELECT COUNT(f.recipe_id) AS favoriteCount,
            // r.recipe_id,
            // rt.type_name,
            // r.recipe_name,
            // r.recipe_level,
            // r.recipe_people,
            // r.recipe_cookingtime,
            // r.recipe_image,
            // r.recipe_ingredients,
            // r.recipe_steps,
            // r.recipe_description
            // FROM recipes r
            // LEFT JOIN recipe_type rt ON r.type_id=rt.type_id
            // LEFT JOIN favorite f ON r.recipe_id=f.recipe_id
            // GROUP BY r.recipe_id HAVING r.recipe_id=${id}`;
            // await DataBaseConnection.query(sqlQuery, async function (error, resultOuter) {
            //     if (!error) {
            //         let sqlQuery = `SELECT COUNT(*) as recipeLike FROM favorite WHERE recipe_id=${id} AND user_id=${user[1]}`;
            //         await DataBaseConnection.query(sqlQuery, async function (error, result) {
            //             if (!error) {
            //                 resultOuter[0].recipeLike = result[0].recipeLike;
            //                 return callback(data = { status: "OK", message: "", recipe: resultOuter[0] });
            //             }
            //         });
            //     } else {
            //         return callback(data = { status: "ERROR", message: "Please Passed a Recipe ID" });
            //     }
            // });
        } else {
            let sqlQuery = `SELECT COUNT(f.recipe_id) AS favoriteCount,
            r.recipe_id,
            rt.type_name,
            r.recipe_name,
            r.recipe_level,
            r.recipe_people,
            r.recipe_cookingtime,
            r.recipe_image,
            r.recipe_ingredients,
            r.recipe_steps,
            r.recipe_description
            FROM recipes r
            LEFT JOIN recipe_type rt ON r.type_id=rt.type_id
            LEFT JOIN favorite f ON r.recipe_id=f.recipe_id
            GROUP BY r.recipe_id
            Having r.recipe_id=${id}`;

            await DataBaseConnection.query(sqlQuery, function (error, result) {
                if (!error) {
                    if (result.length == 0) {
                        return callback(data = { status: "ERROR", message: "RECIPE NOT FOUND" });
                    } else {
                        return callback(data = { status: "OK", message: "", recipe: result[0] });
                    }
                }
            });
        }

        // await recipeUtil.getRecipe(id, user, function (data) {
        //     return callback(data);
        // });
    } catch (error) {
        return callback({ status: "ERROR", message: "Recipe Controller All Sigle Recipe Get Error" });
    }
}

// Add or Remove favorite recipe
recipeController.favorite = async function (body, callback) {
    try {
        if (body.favorite == "" || body.recipe_id == "") {
            return callback({ status: "ERROR", message: "Favorite and recipe_id is not get" });
        }

        // Favorite Recipe Added
        if (body.favorite == 'true') {

            let sqlQueryUser_ID = `select user_id from user where user_email='${body.user_email}' `;
            await DataBaseConnection.query(sqlQueryUser_ID, async function (error, result) {
                if (result.length == 0) {
                    return callback(data = { status: "ERROR", message: "Email ID Is Not Exists" });
                } else {
                    let user_id = result[0].user_id;

                    let sqlCheck = `SELECT COUNT(*) AS count FROM favorite where recipe_id=${body.recipe_id} AND user_id=${user_id}`;
                    await DataBaseConnection.query(sqlCheck, async function (error, result) {
                        if (result[0].count == 1) {
                            return callback(data = { status: "OK", message: "Favorite Recipe Alredy Exists" });
                        } else {
                            let sqlQuery = `INSERT INTO favorite (recipe_id,user_id) VALUES (${body.recipe_id},${user_id}) `;
                            await DataBaseConnection.query(sqlQuery, function (error, result) {
                                if (error) {
                                    return callback(data = { status: "ERROR", message: "Recipe is not Exists" });
                                }
                                if (result.affectedRows === 1) {
                                    return callback(data = { status: "OK", message: "Favorite Recipe Added" });
                                } else {
                                    return callback(data = { status: "ERROR", message: "Favorite is Not Add" });
                                }
                            });
                        };
                    });
                }
            });
            // await recipeUtil.addFavorite(body, function (data) {
            //     return callback(data);
            // });
        }
        // Favorite Recipe Removed
        else {
            let sqlQueryUser_ID = `select user_id from user where user_email='${body.user_email}'`;
            await DataBaseConnection.query(sqlQueryUser_ID, async function (error, result) {
                if (Object.entries(result).length == 0) {
                    return callback(data = { status: "ERROR", message: "USER EMAIL ID NOT PASS IN BODY" });
                }
                let user_id = result[0].user_id;
                let sqlQuery = `DELETE FROM favorite where user_id=${user_id} AND recipe_id=${body.recipe_id}`;
                await DataBaseConnection.query(sqlQuery, function (error, result) {
                    if (error) {
                        return callback(data = { status: "ERROR", message: "Favorite Recipe is Not Exists" });
                    }
                    if (result.affectedRows === 1) {
                        return callback(data = { status: "OK", message: "Favorite Recipe Removed" });
                    } else {
                        return callback(data = { status: "ERROR", message: "Favorite Recipe is Not Exists" });
                    }
                });
            });
            // await recipeUtil.removeFavorite(body, function (data) {
            //     return callback(data);
            // });
        }

    } catch (error) {
        return callback({ status: "ERROR", message: "Recipe Controller Favorite Error" });
    }
}

// Perticular user favorite Recipe
recipeController.userFavoriteRecipe = async function (email, count, callback) {
    try {
        let sqlQueryUser_ID = `select user_id from user where user_email='${email}'`;
        await DataBaseConnection.query(sqlQueryUser_ID, async function (error, result) {
            let user_id = result[0].user_id;

            let sqlQuery = `SELECT  COUNT(r.recipe_id) AS favoriteCount,
            r.recipe_id,
            f.recipe_like as recipeLike,
            rt.type_name,
            r.recipe_name,
            r.recipe_level,
            r.recipe_people,
            r.recipe_cookingtime,
            r.recipe_image,
            r.recipe_description,
            r.recipe_steps
            FROM favorite f
            LEFT JOIN  recipes r ON r.recipe_id=f.recipe_id 
            LEFT JOIN recipe_type rt ON r.type_id=rt.type_id
            GROUP BY r.recipe_id
            HAVING r.recipe_id IN 
            (SELECT 
			r.recipe_id
            FROM favorite f
            LEFT JOIN  recipes r ON r.recipe_id=f.recipe_id 
            WHERE f.user_id=${user_id}
            ORDER BY r.recipe_id DESC )
            ORDER BY r.recipe_id DESC LIMIT ${count},10`;

            await DataBaseConnection.query(sqlQuery, async function (error, result) {
                try {
                    if (!error) {
                        if (result.length != 0) {
                            return callback(data = { status: "OK", message: "", recipes: result });
                        } else {
                            return callback(data = { status: "ERROR", message: "Favorite Recipe is Not Exists" });
                        }
                    } else {
                        console.log(error);
                    }
                } catch (error) {
                    error.message = "Recipe Controller User Favorite Get Error Error";
                }
            });
            // await recipeUtil.userFavoriteRecipe(email, count, function (data) {
            //     return callback(data);
            // });
        });
    } catch (error) {
        return callback({ status: "ERROR", message: "Recipe Controller User Favorite Recipe" });
    }
}


// all perticular user all recipes get
recipeController.userRecipes = async function (email, count, callback) {
    try {
        let sqlQueryUser_ID = `select user_id from user where user_email='${email}'`;
        await DataBaseConnection.query(sqlQueryUser_ID, async function (error, result) {
            let user_id = result[0].user_id;

            let sqlQuery = `SELECT COUNT(f.recipe_id) AS favoriteCount,COUNT(DISTINCT fr.recipe_id) AS recipeLike,
            r.recipe_id,
            rt.type_name,
            r.recipe_name,
            r.recipe_level,
            r.recipe_people,
            r.recipe_cookingtime,
            r.recipe_image,
            r.recipe_description
            FROM recipes r
            JOIN recipe_type rt ON r.type_id=rt.type_id
            LEFT JOIN favorite f ON r.recipe_id=f.recipe_id
            LEFT JOIN favorite fr ON r.recipe_id=fr.recipe_id AND fr.user_id=${user_id}
            WHERE r.user_id=${user_id}
            GROUP BY r.recipe_id
            ORDER BY r.recipe_id DESC  LIMIT ${count},10`;

            await DataBaseConnection.query(sqlQuery, function (error, result) {
                if (!error) {
                    if (result.length == 0) {
                        return callback(data = { status: "ERROR", message: "Recipes not Exists" });
                    } else {
                        return callback(data = { status: "OK", message: "", recipes: result });
                    }
                } else {
                    return callback(data = { status: "ERROR", message: "Recipe not Exists" });
                }
            });
        });
        // await recipeUtil.userGetsRecipes(email, count, function (data) {
        //     return callback(data);
        // });
    } catch (error) {
        return callback({ status: "ERROR", message: "Recipe Controller User Recipes Controller" });
    }
}

// perticular user single recipes get
recipeController.userRecipe = async function (id, auth_token, callback) {
    try {
        await userController.getUserIdToAuthToken(auth_token, async function (user_id) {

            let sqlQuery = `SELECT COUNT(f.recipe_id) AS favoriteCount,COUNT(DISTINCT fr.recipe_id) AS recipeLike,
            r.recipe_id,
            rt.type_name,
            r.recipe_name,
            r.recipe_level,
            r.recipe_people,
            r.recipe_cookingtime,
            r.recipe_image,
            r.recipe_ingredients,
            r.recipe_steps,
            r.recipe_description
            FROM recipes r
            LEFT JOIN recipe_type rt ON r.type_id=rt.type_id
            LEFT JOIN favorite f ON r.recipe_id=f.recipe_id
            LEFT JOIN favorite fr ON r.recipe_id=fr.recipe_id AND fr.user_id=${user_id}
            WHERE r.user_id=${user_id}
            GROUP BY r.recipe_id HAVING r.recipe_id=${id}`;

            await DataBaseConnection.query(sqlQuery, function (error, result) {
                if (!error) {
                    if (result.length == 0) {
                        return callback(data = { status: "ERROR", message: "User is not authorised to this recipe" });
                    } else {
                        return callback(data = { status: "OK", message: "", recipe: result[0] });
                    }
                } else {
                    return callback(data = { status: "ERROR", message: "Recipe Not Exists" });
                }
            });
            // await recipeUtil.userGetRecipe(id, data, function (data) {
            //     return callback(data);
            // });
        });
    } catch (error) {
        return callback({ status: "ERROR", message: "Recipe Controller Perticular User Recipe Get Controller" });
    }
}

// any recipes to comment add
recipeController.addComment = async function (body, callback) {
    try {
        let sqlQueryUser_ID = `select user_id from user where user_email='${body.user_email}'`;
        await DataBaseConnection.query(sqlQueryUser_ID, async function (error, result) {
            let user_id = result[0].user_id;

            let sqlQuery = `INSERT INTO comment (recipe_id,user_id,comment_text) VALUES (${body.recipe_id},${user_id},'${body.comment_text}')`;
            await DataBaseConnection.query(sqlQuery, function (error, result) {
                if (!error) {
                    if (result == undefined) {
                        return callback(data = { status: "ERROR", message: "Comment is Not Added" });
                    } else {
                        return callback(data = { status: "OK", message: "Comment is Added" });
                    }
                } else {
                    return callback(data = { status: "ERROR", message: "Comment is not add recipe_id  is not exists " });
                }
            });
        });
        // await recipeUtil.commentAdd(body, function (data) {
        //     return callback(data);
        // });
    } catch (error) {
        return callback({ status: "ERROR", message: "Recipe Controller Add Comment Error" });
    }
}

// only Show Comment Perticular recipe ID
recipeController.showComment = async function (id, callback) {
    try {
        let sqlQuery = `SELECT c.comment_text,c.comment_time,CONCAT(u.user_firstname," ",u.user_lastname) AS fullname,r.recipe_id
        FROM comment c
        JOIN user u ON u.user_id=c.user_id
        JOIN recipes r ON r.recipe_id=c.recipe_id WHERE r.recipe_id=${id} ORDER BY c.comment_time DESC`;

        await DataBaseConnection.query(sqlQuery, function (error, result) {
            if (!error) {
                if (result.length == 0) {
                    return callback({ status: "ERROR", message: "recipe in comment not Exists" });
                }
                return callback(comment = { status: "OK", message: "", comment: result });
            } else {
                return callback(data = { status: "ERROR", message: "Comment is not show recipe_id  is not match " });
            }
        });
        // recipeUtil.commentShow(id, function (data) {
        //     return callback(data);
        // });
    } catch (error) {
    }
}

module.exports = recipeController;