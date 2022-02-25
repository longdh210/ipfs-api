-- Table: public.nft

-- DROP TABLE public.nft;

CREATE TABLE IF NOT EXISTS public.nft
(
    id integer,
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
VALUES(3,'Huy 4567','https://static.vecteezy.com/packs/media/components/global/search-explore-nav/img/vectors/term-bg-1-666de2d941529c25aa511dc18d727160.jpg','test description','0x1161642e402d07D13B243d678d6d08f476c08c0e')
RETURNING id,name,image,description,addressowner;

SELECT * FROM NFT;
