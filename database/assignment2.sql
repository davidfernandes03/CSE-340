-- Query 1
INSERT INTO public.account (
	account_firstname,
	account_lastname,
	account_email,
	account_password
) VALUES (
	'Tony', 
	'Stark', 
	'tony@starkent.com', 
	'Iam1ronM@n'
);

-- Query 2
UPDATE public.account
SET account_type = 'Admin'
WHERE account_email = 'tony@starkent.com';

-- Query 3
DELETE FROM public.account
WHERE account_email = 'tony@starkent.com';


-- Query 4
UPDATE public.inventory
SET inv_description = REPLACE(
	inv_description, 
	'the small interiors', 
	'a huge interior'
)
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

-- Query 5
SELECT i.inv_make, i.inv_model, c.classification_name
FROM public.inventory i
INNER JOIN public.classification c
ON i.classification_id = c.classification_id
WHERE c.classification_id = 2;

-- Query 6
UPDATE public.inventory
SET 
	inv_image = REPLACE(
        inv_image, '/images/', '/images/vehicles/'
    ), 
	inv_thumbnail = REPLACE(
        inv_thumbnail, '/images/', '/images/vehicles/'
    )
WHERE inv_image LIKE '/images/%' OR inv_thumbnail LIKE '/images/%';