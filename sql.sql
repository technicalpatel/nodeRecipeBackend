SELECT COUNT(f.recipe_id) AS favoriteCount,	    
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
            GROUP BY r.recipe_id ORDER BY r.recipe_id DESC LIMIT 0,10;

SELECT COUNT(f.recipe_id) AS recipeLike	,
            r.recipe_id    
            FROM recipes r
            LEFT JOIN favorite f ON f.recipe_id=r.recipe_id AND f.user_id=2
            GROUP BY r.recipe_id ORDER BY r.recipe_id DESC LIMIT 0,10;

-- Perticular User Recipe Like Or Not
SELECT COUNT(f.user_id) AS recipeLike,
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
            LEFT JOIN favorite f ON f.recipe_id=r.recipe_id AND f.user_id=r.user_id
            WHERE r.user_id=2
            GROUP BY r.recipe_id ORDER BY r.recipe_id DESC;

-- Perticular Recipe IN Which Favorite Count
SELECT COUNT(f.recipe_id) AS favoriteCount,
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
            GROUP BY r.recipe_id HAVING r.recipe_id=1

--Perticular User in Recipe Like or Not
SELECT COUNT(*) as recipeLike FROM favorite WHERE recipe_id=1 AND user_id=2 

--Favorite Recipe in perticular user in How many Count
SELECT COUNT(f.recipe_id) AS favoriteCount,	    
			f.user_id,
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
            GROUP BY r.recipe_id
            HAVING f.user_id=${user_id} ORDER BY r.recipe_id DESC

--Favorite Recipe in selected user Like Or Not
SELECT COUNT(f.recipe_id) AS recipeLike
FROM recipes r
INNER JOIN favorite f ON f.recipe_id=r.recipe_id AND f.user_id=2
GROUP BY r.recipe_id


--ALL Recipe id How Many Count
SELECT  COUNT(r.recipe_id) AS favoriteCount,
			r.recipe_id
            FROM favorite f
            LEFT JOIN  recipes r ON r.recipe_id=f.recipe_id 
            LEFT JOIN recipe_type rt ON r.type_id=rt.type_id
            GROUP BY r.recipe_id
            HAVING r.recipe_id IN (59,58,56,29,8,3,7,1)
            ORDER BY r.recipe_id DESC;

-- ALL FAVORRITE IN PERTICULAR USER ID ALL RECIPE
SELECT  f.favorite_id,
            f.user_id,
			r.recipe_id,
            rt.type_name,
            r.recipe_name,
            r.recipe_level,
            r.recipe_people,
            r.recipe_cookingtime,
            r.recipe_image,
            r.recipe_description
            FROM favorite f
            LEFT JOIN  recipes r ON r.recipe_id=f.recipe_id 
            LEFT JOIN recipe_type rt ON r.type_id=rt.type_id
            WHERE f.user_id=2
            ORDER BY r.recipe_id DESC;


SELECT  COUNT(r.recipe_id) AS favoriteCount,        
            r.recipe_id,
            rt.type_name,
            r.recipe_name,
            r.recipe_level,
            r.recipe_people,
            r.recipe_cookingtime,
            r.recipe_image,
            r.recipe_description
            FROM favorite f
            LEFT JOIN  recipes r ON r.recipe_id=f.recipe_id 
            LEFT JOIN recipe_type rt ON r.type_id=rt.type_id
            GROUP BY r.recipe_id
            HAVING r.recipe_id IN 
            (SELECT 
			r.recipe_id
            FROM favorite f
            LEFT JOIN  recipes r ON r.recipe_id=f.recipe_id 
            WHERE f.user_id=1
            ORDER BY r.recipe_id DESC )
            ORDER BY r.recipe_id DESC



SELECT 	COUNT(f.recipe_id) AS favoriteCount,COUNT(DISTINCT fr.recipe_id) AS recipeLike,
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
            LEFT JOIN favorite fr ON r.recipe_id=fr.recipe_id AND fr.user_id=2
            GROUP BY r.recipe_id
            ORDER BY r.recipe_id DESC LIMIT ${count},10

SELECT 	COUNT(f.recipe_id) AS favoriteCount,COUNT(DISTINCT fr.recipe_id) AS recipeLike,
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
            LEFT JOIN favorite fr ON r.recipe_id=fr.recipe_id AND fr.user_id=2
            GROUP BY r.recipe_id
            HAVING r.recipe_id=59
            ORDER BY r.recipe_id DESC

SELECT COUNT(f.recipe_id) AS favoriteCount,COUNT(DISTINCT fr.recipe_id) AS recipeLike,
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
            LEFT JOIN favorite fr ON r.recipe_id=fr.recipe_id AND fr.user_id=2
            WHERE r.user_id=3
            GROUP BY r.recipe_id
            ORDER BY r.recipe_id DESC


SELECT COUNT(f.recipe_id) AS favoriteCount,COUNT(DISTINCT fr.recipe_id) AS recipeLike,
        (SELECT COUNT(*) FROM recipes WHERE recipe_id=16 AND user_id=3) AS userRecipe,
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
            LEFT JOIN favorite fr ON r.recipe_id=fr.recipe_id AND fr.user_id=3
            GROUP BY r.recipe_id
            HAVING r.recipe_id=16
            ORDER BY r.recipe_id DESC