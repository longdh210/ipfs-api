-- Table: public.nft

DROP TABLE public.nft;

CREATE TABLE IF NOT EXISTS public.nft
(
    id integer PRIMARY KEY,
    name character varying(255) COLLATE pg_catalog."default",
    image character varying(255) COLLATE pg_catalog."default",
    description character varying(255) COLLATE pg_catalog."default",
    addressowner character varying(255) COLLATE pg_catalog."default"
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

INSERT INTO nft (id,name,image,description,addressowner)
VALUES(1,'heineken-logo','https://gateway.pinata.cloud/ipfs/QmTTd6hnh6UwTKT7JgEbHF7FrLzgHN4F9y8uh2PQrbF1ti/heineken-logo.jpg','This is the logo of Heineken brand','0x1161642e402d07D13B243d678d6d08f476c08c0e');

INSERT INTO nft (id,name,image,description,addressowner)
VALUES(2,'heineken-2','https://gateway.pinata.cloud/ipfs/QmTTd6hnh6UwTKT7JgEbHF7FrLzgHN4F9y8uh2PQrbF1ti/heniken2.png','This is the logo of Heineken brand 2','0xad4b1093CaA1e1c9814B3b14BFAb9D32e7bd4B43');


INSERT INTO nft (id,name,image,description,addressowner)
VALUES(3,'heineken-3','https://gateway.pinata.cloud/ipfs/QmTTd6hnh6UwTKT7JgEbHF7FrLzgHN4F9y8uh2PQrbF1ti/heniken3.png','This is the logo of Heineken brand 3','0x1161642e402d07D13B243d678d6d08f476c08c0e');


INSERT INTO nft (id,name,image,description,addressowner)
VALUES(4,'highland coffee','https://gateway.pinata.cloud/ipfs/QmTTd6hnh6UwTKT7JgEbHF7FrLzgHN4F9y8uh2PQrbF1ti/highland.png','This is the logo of Highland coffee brand','0xad4b1093CaA1e1c9814B3b14BFAb9D32e7bd4B43');


INSERT INTO nft (id,name,image,description,addressowner)
VALUES(5,'heineken-5','https://gateway.pinata.cloud/ipfs/QmTTd6hnh6UwTKT7JgEbHF7FrLzgHN4F9y8uh2PQrbF1ti/ken4.png','This is the logo of Heineken brand 5','0x1161642e402d07D13B243d678d6d08f476c08c0e');



//RETURNING id,name,image,description,addressowner;

SELECT * FROM NFT where addressowner='0x1161642e402d07D13B243d678d6d08f476c08c0e';
