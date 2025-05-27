-- ТУТ СКРИПТ КОТОРЫЙ БУДЕТ ВЫПОЛНЕН ПРИ ИНИЦИАЛИЗАЦИИ БАЗЫ ДАННЫХ (ПРИ ПЕРВОМ ЗАПУСКЕ)
--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

-- Started on 2025-05-27 00:01:39

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 246 (class 1259 OID 24823)
-- Name: activity_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activity_types (
    id smallint NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone,
    deleted_at timestamp without time zone
);


ALTER TABLE public.activity_types OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 24822)
-- Name: activity_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.activity_types_id_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.activity_types_id_seq OWNER TO postgres;

--
-- TOC entry 5256 (class 0 OID 0)
-- Dependencies: 245
-- Name: activity_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.activity_types_id_seq OWNED BY public.activity_types.id;


--
-- TOC entry 264 (class 1259 OID 24966)
-- Name: adoption_statuses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.adoption_statuses (
    id integer NOT NULL,
    name character varying(20) NOT NULL,
    description character varying(100)
);


ALTER TABLE public.adoption_statuses OWNER TO postgres;

--
-- TOC entry 263 (class 1259 OID 24965)
-- Name: adoption_statuses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.adoption_statuses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.adoption_statuses_id_seq OWNER TO postgres;

--
-- TOC entry 5257 (class 0 OID 0)
-- Dependencies: 263
-- Name: adoption_statuses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.adoption_statuses_id_seq OWNED BY public.adoption_statuses.id;


--
-- TOC entry 262 (class 1259 OID 24957)
-- Name: animal_genders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.animal_genders (
    id integer NOT NULL,
    name character varying(10) NOT NULL
);


ALTER TABLE public.animal_genders OWNER TO postgres;

--
-- TOC entry 261 (class 1259 OID 24956)
-- Name: animal_genders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.animal_genders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.animal_genders_id_seq OWNER TO postgres;

--
-- TOC entry 5258 (class 0 OID 0)
-- Dependencies: 261
-- Name: animal_genders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.animal_genders_id_seq OWNED BY public.animal_genders.id;


--
-- TOC entry 260 (class 1259 OID 24948)
-- Name: animal_sizes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.animal_sizes (
    id integer NOT NULL,
    name character varying(20) NOT NULL,
    description character varying(100)
);


ALTER TABLE public.animal_sizes OWNER TO postgres;

--
-- TOC entry 259 (class 1259 OID 24947)
-- Name: animal_sizes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.animal_sizes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.animal_sizes_id_seq OWNER TO postgres;

--
-- TOC entry 5259 (class 0 OID 0)
-- Dependencies: 259
-- Name: animal_sizes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.animal_sizes_id_seq OWNED BY public.animal_sizes.id;


--
-- TOC entry 270 (class 1259 OID 25031)
-- Name: article_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.article_categories (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.article_categories OWNER TO postgres;

--
-- TOC entry 269 (class 1259 OID 25030)
-- Name: article_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.article_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.article_categories_id_seq OWNER TO postgres;

--
-- TOC entry 5260 (class 0 OID 0)
-- Dependencies: 269
-- Name: article_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.article_categories_id_seq OWNED BY public.article_categories.id;


--
-- TOC entry 272 (class 1259 OID 25042)
-- Name: articles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.articles (
    id integer NOT NULL,
    category_id integer,
    title character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    excerpt text,
    content text NOT NULL,
    image_url character varying(255),
    is_featured boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.articles OWNER TO postgres;

--
-- TOC entry 271 (class 1259 OID 25041)
-- Name: articles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.articles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.articles_id_seq OWNER TO postgres;

--
-- TOC entry 5261 (class 0 OID 0)
-- Dependencies: 271
-- Name: articles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.articles_id_seq OWNED BY public.articles.id;


--
-- TOC entry 221 (class 1259 OID 24621)
-- Name: breeds; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.breeds (
    id smallint NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.breeds OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 24620)
-- Name: breeds_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.breeds_id_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.breeds_id_seq OWNER TO postgres;

--
-- TOC entry 5262 (class 0 OID 0)
-- Dependencies: 220
-- Name: breeds_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.breeds_id_seq OWNED BY public.breeds.id;


--
-- TOC entry 231 (class 1259 OID 24696)
-- Name: chronic_diseases; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chronic_diseases (
    id bigint NOT NULL,
    name text,
    description text,
    pet_id bigint,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    deleted_at timestamp without time zone
);


ALTER TABLE public.chronic_diseases OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 24695)
-- Name: chronic_diseases_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.chronic_diseases_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.chronic_diseases_id_seq OWNER TO postgres;

--
-- TOC entry 5263 (class 0 OID 0)
-- Dependencies: 230
-- Name: chronic_diseases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.chronic_diseases_id_seq OWNED BY public.chronic_diseases.id;


--
-- TOC entry 239 (class 1259 OID 24770)
-- Name: danger_points; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.danger_points (
    id bigint NOT NULL,
    name text,
    description text,
    coords double precision[],
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    deleted_at timestamp without time zone,
    user_id uuid
);


ALTER TABLE public.danger_points OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 24769)
-- Name: danger_points_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.danger_points_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.danger_points_id_seq OWNER TO postgres;

--
-- TOC entry 5264 (class 0 OID 0)
-- Dependencies: 238
-- Name: danger_points_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.danger_points_id_seq OWNED BY public.danger_points.id;


--
-- TOC entry 244 (class 1259 OID 24807)
-- Name: documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    original_name character varying(255) NOT NULL,
    file_name character varying(255) NOT NULL,
    file_type character varying(255) NOT NULL,
    file_size bigint NOT NULL,
    upload_date timestamp with time zone DEFAULT now(),
    user_id uuid,
    pet_id bigint
);


ALTER TABLE public.documents OWNER TO postgres;

--
-- TOC entry 278 (class 1259 OID 25094)
-- Name: families; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.families (
    id integer NOT NULL,
    owner_id uuid NOT NULL,
    name character varying(100),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);


ALTER TABLE public.families OWNER TO postgres;

--
-- TOC entry 277 (class 1259 OID 25093)
-- Name: families_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.families_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.families_id_seq OWNER TO postgres;

--
-- TOC entry 5265 (class 0 OID 0)
-- Dependencies: 277
-- Name: families_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.families_id_seq OWNED BY public.families.id;


--
-- TOC entry 280 (class 1259 OID 25107)
-- Name: family_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.family_members (
    id integer NOT NULL,
    family_id integer NOT NULL,
    user_id uuid NOT NULL,
    short_name character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);


ALTER TABLE public.family_members OWNER TO postgres;

--
-- TOC entry 279 (class 1259 OID 25106)
-- Name: family_members_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.family_members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.family_members_id_seq OWNER TO postgres;

--
-- TOC entry 5266 (class 0 OID 0)
-- Dependencies: 279
-- Name: family_members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.family_members_id_seq OWNED BY public.family_members.id;


--
-- TOC entry 227 (class 1259 OID 24673)
-- Name: feed_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.feed_types (
    id smallint NOT NULL,
    name text
);


ALTER TABLE public.feed_types OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 24672)
-- Name: feed_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.feed_types_id_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.feed_types_id_seq OWNER TO postgres;

--
-- TOC entry 5267 (class 0 OID 0)
-- Dependencies: 226
-- Name: feed_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.feed_types_id_seq OWNED BY public.feed_types.id;


--
-- TOC entry 218 (class 1259 OID 16417)
-- Name: frequency; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frequency (
    id smallint NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.frequency OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16416)
-- Name: frequency _id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."frequency _id_seq"
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."frequency _id_seq" OWNER TO postgres;

--
-- TOC entry 5268 (class 0 OID 0)
-- Dependencies: 217
-- Name: frequency _id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."frequency _id_seq" OWNED BY public.frequency.id;


--
-- TOC entry 229 (class 1259 OID 24687)
-- Name: injuries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.injuries (
    id bigint NOT NULL,
    name text,
    description text,
    pet_id bigint NOT NULL,
    injury_date timestamp without time zone,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    deleted_at timestamp without time zone
);


ALTER TABLE public.injuries OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 24686)
-- Name: injuries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.injuries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.injuries_id_seq OWNER TO postgres;

--
-- TOC entry 5269 (class 0 OID 0)
-- Dependencies: 228
-- Name: injuries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.injuries_id_seq OWNED BY public.injuries.id;


--
-- TOC entry 225 (class 1259 OID 24659)
-- Name: med_cards; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.med_cards (
    id bigint NOT NULL,
    pet_id bigint,
    weight double precision,
    allergies text,
    feed_type_id smallint,
    feeding_frequency smallint,
    ingredients text,
    serving_size smallint,
    features_of_care text,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    deleted_at timestamp without time zone
);


ALTER TABLE public.med_cards OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 24658)
-- Name: med_cards_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.med_cards_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.med_cards_id_seq OWNER TO postgres;

--
-- TOC entry 5270 (class 0 OID 0)
-- Dependencies: 224
-- Name: med_cards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.med_cards_id_seq OWNED BY public.med_cards.id;


--
-- TOC entry 254 (class 1259 OID 24893)
-- Name: medicine_tracking; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medicine_tracking (
    id integer NOT NULL,
    medicine_id integer NOT NULL,
    status integer NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone,
    deleted_at timestamp without time zone,
    date timestamp without time zone DEFAULT now(),
    CONSTRAINT medicine_tracking_status_check CHECK ((status = ANY (ARRAY[0, 1])))
);


ALTER TABLE public.medicine_tracking OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 24892)
-- Name: medicine_tracking_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medicine_tracking_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medicine_tracking_id_seq OWNER TO postgres;

--
-- TOC entry 5271 (class 0 OID 0)
-- Dependencies: 253
-- Name: medicine_tracking_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.medicine_tracking_id_seq OWNED BY public.medicine_tracking.id;


--
-- TOC entry 252 (class 1259 OID 24858)
-- Name: medicines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medicines (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    dosage character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone,
    deleted_at timestamp without time zone,
    pet_id bigint
);


ALTER TABLE public.medicines OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 24857)
-- Name: medicines_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medicines_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medicines_id_seq OWNER TO postgres;

--
-- TOC entry 5272 (class 0 OID 0)
-- Dependencies: 251
-- Name: medicines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.medicines_id_seq OWNED BY public.medicines.id;


--
-- TOC entry 247 (class 1259 OID 24832)
-- Name: pet_activities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pet_activities (
    pet_id bigint NOT NULL,
    activity_type_id smallint NOT NULL,
    duration_minutes integer,
    distance_km double precision,
    description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone,
    deleted_at timestamp without time zone,
    id bigint NOT NULL
);


ALTER TABLE public.pet_activities OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 24848)
-- Name: pet_activities_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pet_activities_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pet_activities_id_seq OWNER TO postgres;

--
-- TOC entry 5273 (class 0 OID 0)
-- Dependencies: 250
-- Name: pet_activities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pet_activities_id_seq OWNED BY public.pet_activities.id;


--
-- TOC entry 268 (class 1259 OID 25015)
-- Name: pet_photos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pet_photos (
    id integer NOT NULL,
    pet_id integer NOT NULL,
    photo_url text NOT NULL,
    is_primary boolean DEFAULT false,
    upload_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone
);


ALTER TABLE public.pet_photos OWNER TO postgres;

--
-- TOC entry 267 (class 1259 OID 25014)
-- Name: pet_photos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pet_photos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pet_photos_id_seq OWNER TO postgres;

--
-- TOC entry 5274 (class 0 OID 0)
-- Dependencies: 267
-- Name: pet_photos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pet_photos_id_seq OWNED BY public.pet_photos.id;


--
-- TOC entry 223 (class 1259 OID 24630)
-- Name: pets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pets (
    id bigint NOT NULL,
    breed_id smallint,
    birth_date timestamp without time zone,
    logo_url text,
    name text,
    stigma text,
    microchip text,
    description text,
    user_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone,
    deleted_at timestamp without time zone
);


ALTER TABLE public.pets OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 24629)
-- Name: pets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pets_id_seq OWNER TO postgres;

--
-- TOC entry 5275 (class 0 OID 0)
-- Dependencies: 222
-- Name: pets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pets_id_seq OWNED BY public.pets.id;


--
-- TOC entry 256 (class 1259 OID 24920)
-- Name: reminder_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reminder_categories (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    color character varying(20),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone
);


ALTER TABLE public.reminder_categories OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 24919)
-- Name: reminder_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reminder_categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reminder_categories_id_seq OWNER TO postgres;

--
-- TOC entry 5276 (class 0 OID 0)
-- Dependencies: 255
-- Name: reminder_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reminder_categories_id_seq OWNED BY public.reminder_categories.id;


--
-- TOC entry 258 (class 1259 OID 24931)
-- Name: reminders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reminders (
    id bigint NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    start_time time without time zone NOT NULL,
    end_time time without time zone,
    date date NOT NULL,
    importance_level integer DEFAULT 1,
    category_id bigint,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone
);


ALTER TABLE public.reminders OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 24930)
-- Name: reminders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reminders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reminders_id_seq OWNER TO postgres;

--
-- TOC entry 5277 (class 0 OID 0)
-- Dependencies: 257
-- Name: reminders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reminders_id_seq OWNED BY public.reminders.id;


--
-- TOC entry 266 (class 1259 OID 24976)
-- Name: shelter_pets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shelter_pets (
    id integer NOT NULL,
    shelter_id integer NOT NULL,
    breed_id integer,
    name character varying(100) NOT NULL,
    age_months integer,
    size_id integer,
    gender_id integer,
    weight numeric(5,2),
    color character varying(50),
    description text,
    personality text,
    health_status text,
    vaccination_status boolean DEFAULT false,
    sterilization_status boolean DEFAULT false,
    adoption_status_id integer DEFAULT 1,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.shelter_pets OWNER TO postgres;

--
-- TOC entry 265 (class 1259 OID 24975)
-- Name: shelter_pets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shelter_pets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shelter_pets_id_seq OWNER TO postgres;

--
-- TOC entry 5278 (class 0 OID 0)
-- Dependencies: 265
-- Name: shelter_pets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shelter_pets_id_seq OWNED BY public.shelter_pets.id;


--
-- TOC entry 241 (class 1259 OID 24779)
-- Name: shelters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shelters (
    id bigint NOT NULL,
    name text,
    address text,
    coords double precision[],
    description text,
    logo_url text,
    owner_user_id uuid,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    deleted_at timestamp without time zone,
    website_url text,
    phone_number text,
    email text,
    working_hours text
);


ALTER TABLE public.shelters OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 24778)
-- Name: shelters_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shelters_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shelters_id_seq OWNER TO postgres;

--
-- TOC entry 5279 (class 0 OID 0)
-- Dependencies: 240
-- Name: shelters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shelters_id_seq OWNED BY public.shelters.id;


--
-- TOC entry 274 (class 1259 OID 25064)
-- Name: tariffs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tariffs (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    max_pets integer NOT NULL,
    max_family_members integer NOT NULL,
    price numeric(10,2) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);


ALTER TABLE public.tariffs OWNER TO postgres;

--
-- TOC entry 273 (class 1259 OID 25063)
-- Name: tariffs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tariffs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tariffs_id_seq OWNER TO postgres;

--
-- TOC entry 5280 (class 0 OID 0)
-- Dependencies: 273
-- Name: tariffs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tariffs_id_seq OWNED BY public.tariffs.id;


--
-- TOC entry 243 (class 1259 OID 24798)
-- Name: traffic_points; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.traffic_points (
    id bigint NOT NULL,
    coords double precision[] NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    deleted_at timestamp without time zone,
    activity_time text,
    CONSTRAINT valid_coords CHECK (((array_length(coords, 1) = 2) AND ((coords[1] >= ('-90'::integer)::double precision) AND (coords[1] <= (90)::double precision)) AND ((coords[2] >= ('-180'::integer)::double precision) AND (coords[2] <= (180)::double precision))))
);


ALTER TABLE public.traffic_points OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 24797)
-- Name: traffic_points_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.traffic_points_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.traffic_points_id_seq OWNER TO postgres;

--
-- TOC entry 5281 (class 0 OID 0)
-- Dependencies: 242
-- Name: traffic_points_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.traffic_points_id_seq OWNED BY public.traffic_points.id;


--
-- TOC entry 237 (class 1259 OID 24756)
-- Name: treatment_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.treatment_types (
    id smallint NOT NULL,
    name text
);


ALTER TABLE public.treatment_types OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 24755)
-- Name: treatment_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.treatment_types_id_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.treatment_types_id_seq OWNER TO postgres;

--
-- TOC entry 5282 (class 0 OID 0)
-- Dependencies: 236
-- Name: treatment_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.treatment_types_id_seq OWNED BY public.treatment_types.id;


--
-- TOC entry 235 (class 1259 OID 24721)
-- Name: treatments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.treatments (
    id bigint NOT NULL,
    pet_id bigint,
    description text,
    treatment_type_id smallint,
    treatment_date timestamp without time zone,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    deleted_at timestamp without time zone
);


ALTER TABLE public.treatments OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 24720)
-- Name: treatments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.treatments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.treatments_id_seq OWNER TO postgres;

--
-- TOC entry 5283 (class 0 OID 0)
-- Dependencies: 234
-- Name: treatments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.treatments_id_seq OWNED BY public.treatments.id;


--
-- TOC entry 276 (class 1259 OID 25075)
-- Name: user_subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_subscriptions (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    tariff_id integer NOT NULL,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);


ALTER TABLE public.user_subscriptions OWNER TO postgres;

--
-- TOC entry 275 (class 1259 OID 25074)
-- Name: user_subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_subscriptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_subscriptions_id_seq OWNER TO postgres;

--
-- TOC entry 5284 (class 0 OID 0)
-- Dependencies: 275
-- Name: user_subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_subscriptions_id_seq OWNED BY public.user_subscriptions.id;


--
-- TOC entry 219 (class 1259 OID 16425)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    name character varying(255),
    role character varying(50) DEFAULT 'user'::character varying,
    logo_url character varying(255),
    refresh_token character varying(255),
    refresh_token_expiry_time timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp without time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 24705)
-- Name: vaccinations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vaccinations (
    id bigint NOT NULL,
    pet_id bigint,
    name text,
    vaccination_date timestamp without time zone,
    description text,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    deleted_at timestamp without time zone
);


ALTER TABLE public.vaccinations OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 24704)
-- Name: vaccinations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vaccinations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vaccinations_id_seq OWNER TO postgres;

--
-- TOC entry 5285 (class 0 OID 0)
-- Dependencies: 232
-- Name: vaccinations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vaccinations_id_seq OWNED BY public.vaccinations.id;


--
-- TOC entry 249 (class 1259 OID 24841)
-- Name: weight_measurements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.weight_measurements (
    id bigint NOT NULL,
    pet_id bigint NOT NULL,
    weight_kg double precision NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone,
    deleted_at timestamp without time zone
);


ALTER TABLE public.weight_measurements OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 24840)
-- Name: weight_measurements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.weight_measurements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.weight_measurements_id_seq OWNER TO postgres;

--
-- TOC entry 5286 (class 0 OID 0)
-- Dependencies: 248
-- Name: weight_measurements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.weight_measurements_id_seq OWNED BY public.weight_measurements.id;


--
-- TOC entry 4887 (class 2604 OID 24826)
-- Name: activity_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_types ALTER COLUMN id SET DEFAULT nextval('public.activity_types_id_seq'::regclass);


--
-- TOC entry 4907 (class 2604 OID 24969)
-- Name: adoption_statuses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adoption_statuses ALTER COLUMN id SET DEFAULT nextval('public.adoption_statuses_id_seq'::regclass);


--
-- TOC entry 4906 (class 2604 OID 24960)
-- Name: animal_genders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animal_genders ALTER COLUMN id SET DEFAULT nextval('public.animal_genders_id_seq'::regclass);


--
-- TOC entry 4905 (class 2604 OID 24951)
-- Name: animal_sizes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animal_sizes ALTER COLUMN id SET DEFAULT nextval('public.animal_sizes_id_seq'::regclass);


--
-- TOC entry 4917 (class 2604 OID 25034)
-- Name: article_categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.article_categories ALTER COLUMN id SET DEFAULT nextval('public.article_categories_id_seq'::regclass);


--
-- TOC entry 4920 (class 2604 OID 25045)
-- Name: articles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles ALTER COLUMN id SET DEFAULT nextval('public.articles_id_seq'::regclass);


--
-- TOC entry 4872 (class 2604 OID 24624)
-- Name: breeds id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.breeds ALTER COLUMN id SET DEFAULT nextval('public.breeds_id_seq'::regclass);


--
-- TOC entry 4878 (class 2604 OID 24699)
-- Name: chronic_diseases id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chronic_diseases ALTER COLUMN id SET DEFAULT nextval('public.chronic_diseases_id_seq'::regclass);


--
-- TOC entry 4882 (class 2604 OID 24773)
-- Name: danger_points id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.danger_points ALTER COLUMN id SET DEFAULT nextval('public.danger_points_id_seq'::regclass);


--
-- TOC entry 4930 (class 2604 OID 25097)
-- Name: families id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.families ALTER COLUMN id SET DEFAULT nextval('public.families_id_seq'::regclass);


--
-- TOC entry 4932 (class 2604 OID 25110)
-- Name: family_members id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.family_members ALTER COLUMN id SET DEFAULT nextval('public.family_members_id_seq'::regclass);


--
-- TOC entry 4876 (class 2604 OID 24676)
-- Name: feed_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feed_types ALTER COLUMN id SET DEFAULT nextval('public.feed_types_id_seq'::regclass);


--
-- TOC entry 4867 (class 2604 OID 16420)
-- Name: frequency id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frequency ALTER COLUMN id SET DEFAULT nextval('public."frequency _id_seq"'::regclass);


--
-- TOC entry 4877 (class 2604 OID 24690)
-- Name: injuries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.injuries ALTER COLUMN id SET DEFAULT nextval('public.injuries_id_seq'::regclass);


--
-- TOC entry 4875 (class 2604 OID 24662)
-- Name: med_cards id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.med_cards ALTER COLUMN id SET DEFAULT nextval('public.med_cards_id_seq'::regclass);


--
-- TOC entry 4895 (class 2604 OID 24896)
-- Name: medicine_tracking id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicine_tracking ALTER COLUMN id SET DEFAULT nextval('public.medicine_tracking_id_seq'::regclass);


--
-- TOC entry 4893 (class 2604 OID 24861)
-- Name: medicines id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicines ALTER COLUMN id SET DEFAULT nextval('public.medicines_id_seq'::regclass);


--
-- TOC entry 4890 (class 2604 OID 24849)
-- Name: pet_activities id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pet_activities ALTER COLUMN id SET DEFAULT nextval('public.pet_activities_id_seq'::regclass);


--
-- TOC entry 4914 (class 2604 OID 25018)
-- Name: pet_photos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pet_photos ALTER COLUMN id SET DEFAULT nextval('public.pet_photos_id_seq'::regclass);


--
-- TOC entry 4873 (class 2604 OID 24633)
-- Name: pets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pets ALTER COLUMN id SET DEFAULT nextval('public.pets_id_seq'::regclass);


--
-- TOC entry 4898 (class 2604 OID 24923)
-- Name: reminder_categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reminder_categories ALTER COLUMN id SET DEFAULT nextval('public.reminder_categories_id_seq'::regclass);


--
-- TOC entry 4901 (class 2604 OID 24934)
-- Name: reminders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reminders ALTER COLUMN id SET DEFAULT nextval('public.reminders_id_seq'::regclass);


--
-- TOC entry 4908 (class 2604 OID 24979)
-- Name: shelter_pets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shelter_pets ALTER COLUMN id SET DEFAULT nextval('public.shelter_pets_id_seq'::regclass);


--
-- TOC entry 4883 (class 2604 OID 24782)
-- Name: shelters id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shelters ALTER COLUMN id SET DEFAULT nextval('public.shelters_id_seq'::regclass);


--
-- TOC entry 4924 (class 2604 OID 25067)
-- Name: tariffs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tariffs ALTER COLUMN id SET DEFAULT nextval('public.tariffs_id_seq'::regclass);


--
-- TOC entry 4884 (class 2604 OID 24801)
-- Name: traffic_points id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.traffic_points ALTER COLUMN id SET DEFAULT nextval('public.traffic_points_id_seq'::regclass);


--
-- TOC entry 4881 (class 2604 OID 24759)
-- Name: treatment_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.treatment_types ALTER COLUMN id SET DEFAULT nextval('public.treatment_types_id_seq'::regclass);


--
-- TOC entry 4880 (class 2604 OID 24724)
-- Name: treatments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.treatments ALTER COLUMN id SET DEFAULT nextval('public.treatments_id_seq'::regclass);


--
-- TOC entry 4927 (class 2604 OID 25078)
-- Name: user_subscriptions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_subscriptions ALTER COLUMN id SET DEFAULT nextval('public.user_subscriptions_id_seq'::regclass);


--
-- TOC entry 4879 (class 2604 OID 24708)
-- Name: vaccinations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vaccinations ALTER COLUMN id SET DEFAULT nextval('public.vaccinations_id_seq'::regclass);


--
-- TOC entry 4891 (class 2604 OID 24844)
-- Name: weight_measurements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weight_measurements ALTER COLUMN id SET DEFAULT nextval('public.weight_measurements_id_seq'::regclass);


--
-- TOC entry 5216 (class 0 OID 24823)
-- Dependencies: 246
-- Data for Name: activity_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.activity_types (id, name, description, created_at, updated_at, deleted_at) FROM stdin;
1	Прогулка	\N	2025-04-23 11:08:50.696394	\N	\N
2	Измерение веса	\N	2025-04-23 11:09:01.810169	\N	\N
3	Прием лекарств	\N	2025-04-23 11:09:15.208567	\N	\N
4	Тренировка	\N	2025-04-23 11:23:37.609208	\N	\N
\.


--
-- TOC entry 5234 (class 0 OID 24966)
-- Dependencies: 264
-- Data for Name: adoption_statuses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.adoption_statuses (id, name, description) FROM stdin;
1	Ищет семью	Питомец доступен для усыновления
2	Забронирован	Питомец зарезервирован для усыновления
3	Забрали!	Питомец уже усыновлён
4	На передержке	Временное содержание (передержка)
5	На карантине	На карантине/лечении
\.


--
-- TOC entry 5232 (class 0 OID 24957)
-- Dependencies: 262
-- Data for Name: animal_genders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.animal_genders (id, name) FROM stdin;
1	мужской
2	женский
\.


--
-- TOC entry 5230 (class 0 OID 24948)
-- Dependencies: 260
-- Data for Name: animal_sizes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.animal_sizes (id, name, description) FROM stdin;
1	мелкий	Вес до 10 кг
2	средний	Вес 10-25 кг
3	крупный	Вес более 25 кг
\.


--
-- TOC entry 5240 (class 0 OID 25031)
-- Dependencies: 270
-- Data for Name: article_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.article_categories (id, name, slug, created_at, updated_at) FROM stdin;
1	Безопасность	bezopasnost	2025-05-07 13:06:00.416638	2025-05-07 13:06:00.416638
2	Дрессировка	dressirovka	2025-05-07 13:06:00.416638	2025-05-07 13:06:00.416638
3	Здоровье	zdorove	2025-05-07 13:06:00.416638	2025-05-07 13:06:00.416638
4	Питание	pitanie	2025-05-07 13:06:00.416638	2025-05-07 13:06:00.416638
\.


--
-- TOC entry 5242 (class 0 OID 25042)
-- Dependencies: 272
-- Data for Name: articles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.articles (id, category_id, title, slug, excerpt, content, image_url, is_featured, created_at, updated_at) FROM stdin;
3	1	Как защитить собаку от догхантеров	zashchita-ot-dogkhantorov	Простые меры предосторожности для вашего питомца	Догхантеры — это люди, которые целенаправленно травят собак, разбрасывая отравленные приманки в парках, дворах и других местах выгула животных. Их действия приводят к мучительной гибели питомцев, и каждый ответственный владелец должен знать, как защитить своего четвероногого друга.\n\nЧем опасны догхантеры?\nОхотники на собак используют разные методы. Чаще всего они прячут яд в кусочках колбасы, сосисок или фарша. Внутри могут быть смертельные таблетки, такие как изониазид или крысиный яд. Иногда в еду вкладывают иглы или лезвия, которые травмируют желудок и кишечник животного. Еще одна опасность — антифриз, который сладкий на вкус и привлекает собак.\n\nКак обезопасить питомца?\nВо время прогулок старайтесь не спускать собаку с поводка в незнакомых местах. Очень важно научить ее команде «Фу!», чтобы она не подбирала еду с земли. Если ваш питомец склонен к этому, лучше выгуливать его в наморднике. Избегайте подозрительных мест — пустырей, кустов, детских площадок, где часто находят отравленные приманки.\n\nДома и во дворе тоже нужно быть внимательным. Перед тем как выпустить собаку, проверьте территорию на наличие посторонних предметов. Никогда не оставляйте еду на улице — догхантеры могут подбросить яд даже в миску. Если живете в частном доме, установите камеры наблюдения.\n\nЧто делать, если собака съела отраву?\nПервые признаки отравления — рвота, понос (иногда с кровью), судороги, шаткая походка, пена изо рта, затрудненное дыхание, вялость или, наоборот, перевозбуждение. В таком случае действовать нужно быстро.\n\nЕсли собака в сознании, попробуйте вызвать рвоту. Для этого подойдет 3% перекись водорода (1–2 мл на кг веса) или раствор соли (1 столовая ложка на стакан воды). Затем дайте сорбент — активированный уголь или «Энтеросгель». Но самое главное — немедленно везите питомца к ветеринару! Если нашли подозрительный предмет, возьмите его с собой — это поможет врачу быстрее подобрать антидот.\n\nКак бороться с догхантерами?\nЕсли вы столкнулись с такими людьми, не вступайте в конфликт — они могут быть опасны. Лучше сфотографируйте их или их приманки, соберите доказательства и обратитесь в полицию. Жестокое обращение с животными — это уголовное преступление (ст. 245 УК РФ).\n\nРассказывайте об этой проблеме другим владельцам собак. Чем больше людей будет знать о методах догхантеров, тем сложнее им будет действовать.\n\nГлавное — бдительность\nСпасение жизни вашего питомца зависит от вашей внимательности и готовности действовать в критической ситуации. Делитесь этой информацией, предупреждайте соседей, объединяйтесь с другими собаководами. Вместе мы сможем защитить наших любимцев от жестокости.	/src/assets/articles/doghenters.png	t	2025-05-07 13:06:00.416638	2025-05-07 13:06:00.416638
5	1	Первые шаги в дрессировке: как воспитать послушного щенка	osnovy-dressirovki-shhenka	С чего начать обучение щенка и какие ошибки совершают 90% новичков	Когда в доме появляется щенок, многие владельцы совершают одну и ту же ошибку – откладывают дрессировку "на потом". Но именно в 2-4 месяца формируются привычки, которые останутся на всю жизнь. Первые занятия должны напоминать веселую игру, а не строгий урок. \n\nПредставьте ситуацию: вы подносите кусочек сыра к носу щенка, медленно поднимаете руку вверх – и вот он уже инстинктивно садится, заглядывая вам в глаза в ожидании одобрения. Это момент, когда закладывается взаимопонимание. Главное – сразу же радостно похвалить и дать лакомство. Так команда "сидеть" запомнится не как принуждение, а как приятный ритуал.\n\nОпасное заблуждение – считать, что щенок "еще маленький" и не способен учиться. На практике даже 8-недельные малыши прекрасно усваивают базовые команды. Секрет в коротких 5-минутных сеансах несколько раз в день. Дольше – значит переутомить. Лучше закончить на позитивной ноте, чем доводить до усталости.\n\nСамые критичные ошибки, которые я вижу у начинающих: крики, физические наказания и непостоянство. Если сегодня разрешать прыгать на диван, а завтра ругать за это – щенок просто не поймет, чего от него хотят. Все в семье должны использовать одинаковые команды и правила. \n\nЗапомните: нет "глупых" пород. Есть нетерпеливые хозяева. Лабрадор Бакстер из нашего примера за две недели научился не только садиться по команде, но и аккуратно брать лакомство с ладони. Его секрет – ежедневные мини-тренировки с кусочками вареной курицы и обязательная похвала за каждый успех.	https://example.com/images/puppy-training.jpg	t	2025-05-09 14:11:01.495613	2025-05-09 14:11:01.495613
6	2	Тихая угроза: продукты-убийцы в вашем холодильнике	opasnye-produkty-dlya-sobak	Что из человеческой еды вызывает мучительную смерть у собак и как действовать в случае отравления	Обычная плитка шоколада, оставленная на столе, может стать смертельным оружием в лапах вашего питомца. Всего 50 граммов темного шоколада содержат достаточную дозу теобромина, чтобы убить собаку весом 10 кг. Первые признаки – беспокойство, учащенное сердцебиение, затем судороги. К сожалению, многие владельцы понимают опасность только когда питомцу уже требуется экстренная помощь.\n\nНо шоколад – не единственный убийца. Гораздо коварнее виноград и изюм. Всего 5-6 изюминок способны вызвать необратимую почечную недостаточность у средней собаки. Причем симптомы проявляются не сразу, а через 12-24 часа, когда яд уже сделал свое дело. Лук и чеснок действуют еще более скрытно – разрушают эритроциты постепенно, и только через несколько дней вы заметите слабость и темную мочу.\n\nСовсем недавно в клинику поступила такса Макс, стащившая луковый суп. Хозяева не придали значения – подумаешь, немного бульона! Через три дня псу потребовалось переливание крови. А история овчарки Рекса, съевшей шоколадную плитку, закончилась хорошо только благодаря мгновенной реакции – хозяин сразу вызвал рвоту и повез собаку в клинику.\n\nЕсли подобное произошло с вашим питомцем, помните: каждая минута на счету. 1 столовая ложка 3%-ной перекиси водорода на 5 кг веса – эта простая смесь может спасти жизнь, если успеть дать ее в первые два часа. Затем – активированный уголь (целая таблетка на каждый килограмм веса) и срочно к ветеринару. Обязательно возьмите образец того, что съела собака – это поможет врачу быстрее подобрать антидот.\n\nЛучшая защита – профилактика. Установите железное правило: "Еда только из миски". Объясните детям, что "угостить собачку" шоколадкой – значит подвергнуть ее смертельной опасности. И никогда не оставляйте опасные продукты в зоне досягаемости – голодный питомец может проявить невероятную изобретательность, чтобы добраться до запретного.	https://example.com/images/dangerous-foods.jpg	t	2025-05-09 14:11:01.495613	2025-05-09 14:11:01.495613
11	3	Чрезвычайные ситуации: что делать до приезда ветеринара	pervaya-pomoshch-sobake	Пошаговый алгоритм действий при травмах, отравлениях и других угрожающих состояниях	Автомобиль сбил собаку — такое сообщение часто приходит в наши чаты экстренной помощи. Первая реакция хозяев — подхватить питомца на руки и мчаться в клинику. Стоп! Это может убить животное. \n\nПри ДТП:\n1. Наденьте намордник (даже добрый пёс в шоке может укусить).\n2. Аккуратно переложите на жёсткую поверхность (дверь, доска).\n3. Не пытайтесь вправить переломы — только зафиксировать.\n4. При кровотечении — давящая повязка (не жгут!).\n\nОтравление — вторая по частоте причина. Если собака наелась крысиного яда, не теряйте время на перекись — сразу везите в клинику. А вот при проглатывании изониазида (средство от догхантеров) счёт идёт на минуты: укол витамина B6 (пиридоксина) может спасти жизнь. \n\nОсобый случай — тепловой удар. Никогда не обливайте собаку ледяной водой! Резкое охлаждение вызывает спазм сосудов. Правильно — завернуть в мокрое прохладное полотенце и дать попить мелкими глотками.\n\nСоберите аптечку заранее: перекись, бинты, антигистаминные, цифровой термометр. И сохраните номер ближайшей круглосуточной клиники в память телефона — в критической ситуации каждая секунда дорога.	https://example.com/images/dog-first-aid.jpg	t	2025-05-09 14:19:34.846496	2025-05-09 14:19:34.846496
12	4	Городские джунгли: как защитить собаку на прогулке	progulki-v-gorode	Невидимые опасности мегаполиса и как уберечь питомца от травм и стресса	Казалось бы, обычная прогулка в парке — что может случиться? Но город таит множество угроз, о которых владельцы даже не догадываются. Ветеринары клиники "Зоостатус" поделились шокирующей статистикой: 60% летних случаев — ожоги лап об асфальт. В жару поверхность нагревается до 60°C, и достаточно 30 секунд контакта, чтобы получить болезненные волдыри.\n\nОсобую опасность представляют реагенты зимой. История лабрадора Бадди закончилась операцией — химикаты разъели подушечки до мяса. Теперь его выгуливают исключительно в специальных ботинках. Но не только дороги несут угрозу. Кусты у тротуаров часто становятся местом, где догхантеры раскладывают приманки. А в траве могут валяться осколки или шприцы.\n\nЗолотые правила городского выгула:\n- Всегда держите поводок на оживлённых улицах (внезапный гудок машины может спугнуть даже дрессированную собаку)\n- Выбирайте маршруты вдали от дорог — идеально парки с газонами\n- В жару гуляйте до 10 утра и после 18 вечера\n- После прогулки мойте лапы и осматривайте подушечки\n\nИ главное — научите собаку команде "рядом". Это не просто удобно, а жизненно необходимо. Овчарка Рокси спаслась именно благодаря этому навыку, когда вырвалась и могла попасть под колёса, но по команде сразу вернулась к хозяйке.	https://example.com/images/city-walks.jpg	t	2025-05-09 14:20:16.837319	2025-05-09 14:20:16.837319
13	3	Особый рацион: как кормить стареющую собаку	pitanie-pozhilyh-sobak	Какие изменения в питании продлят жизнь вашему питомцу после 7 лет	Когда 12-летний шпиц Микки начал стремительно набирать вес, хозяйка просто уменьшила порции. Казалось логичным — меньше еды, меньше калорий. Но проблема усугубилась: появилась одышка, апатия. Ветеринарный диетолог объяснил ошибку — у пожилых собак нужно не сокращать питание, а полностью менять его состав.\n\nПосле 7 лет (для крупных пород — после 5) метаболизм замедляется на 20-30%. Но это не значит, что собака должна голодать. Наоборот — пища должна стать:\n- Более лёгкой (меньше жиров, больше белка)\n- Богатой клетчаткой (для пищеварения)\n- С добавлением хондропротекторов (глюкозамин для суставов)\n\nРеальный пример: 10-летний боксёр Арчи страдал от артрита. После перехода на специализированный корм с омега-3 и куркумином его подвижность улучшилась на 40% за месяц.\n\nОпасные заблуждения:\n1. "Пусть ест то же, что и раньше, просто меньше" — приводит к дефициту питательных веществ\n2. "Натуралка всегда лучше" — сложно сбалансировать для возрастных собак\n3. "Если просит — значит голодная" — многие пожилые собаки теряют чувство сытости\n\nРаз в полгода обязательно сдавайте биохимический анализ крови — это поможет корректировать диету при возрастных изменениях почек или печени.	https://example.com/images/senior-dog-food.jpg	f	2025-05-09 14:20:16.837319	2025-05-09 14:20:16.837319
14	1	Когда любви недостаточно: как справиться с агрессией питомца	agressiya-u-sobak	Почему добрая собака вдруг становится злой и можно ли это исправить	История немецкой овчарки Грея потрясла всех в нашем кинологическом клубе. Воспитанный с любовью пёс внезапно укусил ребёнка хозяев. Причём до этого момента никогда не проявлял агрессии. Разбор случая показал: всё началось с того, что мальчик случайно наступил Грею на лапу во время игры. Собака зарычала — это проигнорировали. Потом защёлкивала зубы рядом с рукой — списали на "играется". Результат — серьёзная травма и тяжёлое решение об усыплении.\n\nАгрессия никогда не возникает "вдруг". Это всегда накопительный эффект. Первые тревожные звоночки:\n- Замирание и пристальный взгляд перед действием\n- Поджимание губ, обнажающее зубы\n- Рычание при приближении к миске или игрушкам\n\nЧто делать, если вы заметили эти признаки:\n1. Немедленно обратитесь к кинологу-зоопсихологу (не пытайтесь решить проблему самостоятельно)\n2. Исключите физические причины — больные зубы, артрит (50% случаев агрессии связаны с хронической болью)\n3. Никогда не наказывайте физически — это только усилит проблему\n\nСлучай ротвейлера Тора доказал: даже серьёзную агрессию можно скорректировать. После 6 месяцев работы со специалистом пёс перестал реагировать на других собак и спокойно разрешает осматривать зубы. Но ключевое условие — хозяева строго соблюдали все рекомендации.	https://example.com/images/dog-aggression.jpg	t	2025-05-09 14:20:16.837319	2025-05-09 14:20:16.837319
15	4	В дорогу: как путешествовать с собакой без стресса	puteshestviya-s-sobakoy	Подробный гид по перевозке питомца в машине, поезде и самолёте	Когда семья Сидоровых впервые решила взять своего корги Марсика в отпуск, это обернулось кошмаром. Пёс выл всю дорогу в поезде, отказывался от еды, а на месте постоянно дрожал. Оказалось, они допустили все возможные ошибки: не подготовили собаку к поездке, не взяли привычные вещи и выбрали самый стрессовый вид транспорта.\n\nПосле консультации с кинологом следующее путешествие прошло идеально. Секрет в правильной подготовке:\n- За месяц до поездки начинайте приучать к переноске (кладите туда лакомства, сделайте уютное гнездо)\n- Для автомобиля — короткие тестовые поездки, постепенно увеличивая время\n- Всегда берите "дорожный набор": любимую игрушку, воду из дома, подстилку с родным запахом\n\nОсобенно сложно летать с собаками-брахицефалами (мопсы, бульдоги). Из-за особенностей строения морды они тяжело переносят перепады давления. Авиакомпании часто отказывают в перевозке таких пород в багажном отсеке — и это правильно.\n\nРеальный лайфхак от опытных путешественников: перед долгой дорогой устаньте собаку активной прогулкой. Уставший пёс будет спать большую часть пути. И никогда не кормите за 3-4 часа до поездки — это снизит риск укачивания.\n\nПомните: не все отели готовы принять животных. Бронируя жильё, уточняйте этот момент сразу. И обязательно возьмите справку от ветеринара о прививках — её могут проверить на границе.	https://example.com/images/dog-travel.jpg	f	2025-05-09 14:20:16.837319	2025-05-09 14:20:16.837319
17	1	Закон о собаках: что можно и что запрещено владельцам в 2024 году	zakon-o-sobakah	Разбор Федерального закона №498 "Об ответственном обращении с животными" и штрафов за нарушения	С января 2020 года в России действует жёсткое регулирование содержания домашних животных. История москвича Артёма К., оштрафованного на 80 000 рублей за выгул стаффордширского терьера без намордника в парке, наглядно показывает — закон применяют на практике.\n\n**Основные положения:**\n- Обязательная регистрация потенциально опасных пород (включая питбулей, амстаффов и кавказских овчарок)\n- Запрет на выгул без поводка в общественных местах (штраф 1-5 тыс. рублей)\n- Обязательное чипирование для вывоза за границу\n- Запрет на содержание в коммуналках и на балконах\n\nСамые спорные моменты касаются "списка опасных пород". Владелец бультерьера из Екатеринбурга оспорил в суде требование носить намордник, доказав, что его собака прошла тест на лояльность. Но такие случаи — исключение. \n\n**Что многие не знают:**\n1. Даже за лай после 23:00 могут оштрафовать (до 3 тыс. рублей по закону о тишине)\n2. За жестокое обращение (включая лишение воды/еды) грозит уголовная ответственность (ст. 245 УК РФ)\n3. Собака, причинившая вред, подлежит конфискации\n\nСовет юриста: всегда носите с собой паспорт собаки и свидетельство о прививках. При конфликтах с соседями или полицией это главные доказательства вашей ответственности как владельца.	https://example.com/images/dog-law.jpg	t	2025-05-09 14:23:06.148014	2025-05-09 14:23:06.148014
18	1	Как законно перевозить собаку в поезде, самолёте и общественном транспорте	pravila-perevozki-sobak	Новые правила РЖД и авиакомпаний 2024 года с примерами из судебной практики	Скандальный случай в аэропорту Шереметьево, когда пассажирке отказали в посадке с чихуахуа, показал — знание законов экономит нервы и деньги. С 2023 года действуют единые ветеринарные правила ЕАЭС, но каждая транспортная компания устанавливает дополнительные ограничения.\n\n**Железная дорога (Приказ РЖД №2586):**\n- Мелкие собаки (до 10 кг) — в переносках (габариты не более 55×40×35 см)\n- Крупные — только в тамбурах плацкартных вагонов или купе\n- Обязателен ветеринарный паспорт с отметкой о прививке от бешенства\n\n**Самолёты:**\n- Собаки-поводыри перевозятся бесплатно при наличии сертификата\n- Максимальный вес с контейнером — 50 кг (в багажном отсеке)\n- У короткомордых пород требуется справка о здоровье (риск дыхательной недостаточности)\n\n**Городской транспорт:**\n- Требуется намордник и поводок (даже для мелких пород)\n- В метро — только в переносках\n- Водители такси вправе отказать в перевозке\n\nРеальный пример: пенсионерка из Казани выиграла суд у такси-сервиса, незаконно потребовавшего доплату за перевозку йоркширского терьера. Суд ссылался на ст. 14.1 КоАП о дискриминации потребителей.	https://example.com/images/dog-transport.jpg	f	2025-05-09 14:23:06.148014	2025-05-09 14:23:06.148014
\.


--
-- TOC entry 5191 (class 0 OID 24621)
-- Dependencies: 221
-- Data for Name: breeds; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.breeds (id, name) FROM stdin;
1	Акита-ину
2	Аляскинский маламут
3	Американский бульдог
4	Американский кокер-спаниель
5	Американский стаффордширский терьер
6	Английский бульдог
7	Английский кокер-спаниель
8	Английский мастиф
9	Английский сеттер
10	Английский спрингер-спаниель
11	Английский той-терьер
12	Аппенцеллер зенненхунд
13	Аргентинский дог
14	Афганская борзая
15	Аффенпинчер
16	Бассет-хаунд
17	Бедлингтон-терьер
18	Бельгийская овчарка (Грюнендаль)
19	Бельгийская овчарка (Лакенуа)
20	Бельгийская овчарка (Малинуа)
21	Бельгийская овчарка (Тервюрен)
22	Бернский зенненхунд
23	Бигль
24	Бишон фризе
25	Бладхаунд
26	Бобтейл
27	Боксер
28	Бордер-колли
29	Бордер-терьер
30	Бордоский дог
31	Бостон-терьер
32	Бриар
33	Бульмастиф
34	Бультерьер
35	Веймаранер
36	Вельш-корги кардиган
37	Вельш-корги пемброк
38	Вельш-спрингер-спаниель
39	Вельш-терьер
40	Вест-хайленд-уайт-терьер
41	Волчья собака Сарлоса
42	Вольфшпиц (Кеесхонд)
43	Восточно-европейская овчарка
44	Гаванский бишон
45	Гладкошерстный фокстерьер
46	Голден ретривер
47	Грейхаунд
48	Гренландская собака
49	Далматин
50	Джек-рассел-терьер
51	Доберман
52	Дратхаар
53	Дункер
54	Евразиер
55	Золотистый ретривер
56	Ирландский волкодав
57	Ирландский красный сеттер
58	Ирландский мягкошерстный пшеничный терьер
59	Ирландский терьер
60	Испанский мастиф
61	Итальянский кане-корсо
62	Йоркширский терьер
63	Кавалер-кинг-чарльз-спаниель
64	Кавказская овчарка
65	Канарский дог
66	Кане-корсо
67	Каракачанская собака
68	Карликовый пинчер
69	Кеесхонд
70	Керн-терьер
71	Керри-блю-терьер
72	Кинг-чарльз-спаниель
73	Китайская хохлатая собака
74	Кламбер-спаниель
75	Колли длинношерстный
76	Колли короткошерстный
77	Комондор
78	Котон-де-тулеар
79	Кромфорлендер
80	Курцхаар
81	Лабрадор ретривер
82	Лаготто-романьоло
83	Лайка
84	Ланкаширский хилер
85	Леонбергер
86	Лхаса апсо
87	Мальтийская болонка
88	Манчестер-терьер
89	Мареммо-абруццкая овчарка
90	Миниатюрный бультерьер
91	Миниатюрный шнауцер
92	Мопс
93	Московская сторожевая
94	Неаполитанский мастиф
95	Немецкая овчарка
96	Немецкий боксер
97	Немецкий дог
98	Немецкий шпиц
99	Норвич-терьер
100	Ньюфаундленд
101	Овернский бракк
102	Папильон
103	Парсон-рассел-терьер
104	Пекинес
105	Пиренейская горная собака
106	Пиренейский мастиф
107	Померанский шпиц
108	Португальская водяная собака
109	Пудель
110	Пули
111	Пуми
112	Родезийский риджбек
113	Ротвейлер
114	Русская псовая борзая
115	Русский той-терьер
116	Салюки
117	Самоедская собака
118	Сенбернар
119	Сиба-ину
120	Сибирский хаски
121	Скотч-терьер
122	Стаффордширский бультерьер
123	Такса
124	Тибетский мастиф
125	Тибетский спаниель
126	Тибетский терьер
127	Той-фокстерьер
128	Уиппет
129	Фараонова собака
130	Финский шпиц
131	Фландрский бувье
132	Фокстерьер
133	Французский бульдог
134	Ховаварт
135	Хоккайдо
136	Цвергпинчер
137	Цвергшнауцер
138	Чау-чау
139	Чехословацкая волчья собака
140	Чихуахуа
141	Шарпей
142	Шелти
143	Ши-тцу
144	Шипперке
145	Энтлебухер зенненхунд
146	Эрдельтерьер
147	Ягдтерьер
148	Японский хин
149	Японский шпиц
\.


--
-- TOC entry 5201 (class 0 OID 24696)
-- Dependencies: 231
-- Data for Name: chronic_diseases; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chronic_diseases (id, name, description, pet_id, created_at, updated_at, deleted_at) FROM stdin;
1	Подозрение на гельминтов	Назначили УЗИ и Милпразон	3	2025-03-25 18:12:06.122597	2025-03-25 18:12:06.122597	2025-03-25 18:12:22.584028
\.


--
-- TOC entry 5209 (class 0 OID 24770)
-- Dependencies: 239
-- Data for Name: danger_points; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.danger_points (id, name, description, coords, created_at, updated_at, deleted_at, user_id) FROM stdin;
1	Отрава для собак	Розовые таблетки, похожие на лекарство от туберкулеза	{59.930832,30.419359}	2025-03-25 23:01:25.011713	2025-03-25 23:01:25.011713	\N	98344918-f676-4f47-9ad9-cdcd913aeb1b
2	Бродячие собаки	Очень голодные	{59.933760705295015,30.3830491947081}	2025-03-26 13:14:09.082989	2025-03-26 13:14:09.082989	\N	98344918-f676-4f47-9ad9-cdcd913aeb1b
3	Отрава для собак	Розовые таблетки, похожие на лекарство от туберкулеза	{59.930832,30.419359}	2025-04-30 20:36:47.016307	2025-04-30 20:36:47.016307	\N	98344918-f676-4f47-9ad9-cdcd913aeb1b
4	Бродячие собаки		{59.95292630963399,30.38261954551573}	2025-04-30 20:53:50.033687	2025-04-30 20:53:50.033687	\N	98344918-f676-4f47-9ad9-cdcd913aeb1b
5	Бродячие собаки		{55.771319073457214,37.62638438134764}	2025-04-30 20:54:00.356613	2025-04-30 20:54:00.356613	\N	98344918-f676-4f47-9ad9-cdcd913aeb1b
6	Бродячие собаки		{55.76570629956584,37.57797587304685}	2025-05-07 11:21:52.691779	2025-05-07 11:21:52.691779	\N	98344918-f676-4f47-9ad9-cdcd913aeb1b
7	Битое стекло	Осторожно, очень много и мелкого	{59.961846647094916,30.38083582948613}	2025-05-07 12:58:07.152207	2025-05-07 12:58:07.152207	\N	98344918-f676-4f47-9ad9-cdcd913aeb1b
\.


--
-- TOC entry 5214 (class 0 OID 24807)
-- Dependencies: 244
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.documents (id, original_name, file_name, file_type, file_size, upload_date, user_id, pet_id) FROM stdin;
55494c34-5d5b-4169-b57a-fcc4c82a327f	160359_ПЦР_диагностика_собаки_#146301_Собака_Нобель.pdf	dffb4ca3-3c18-4506-9a02-1b577ed33988.pdf	application/pdf	86634	2025-04-30 20:55:38.138966+03	98344918-f676-4f47-9ad9-cdcd913aeb1b	3
\.


--
-- TOC entry 5248 (class 0 OID 25094)
-- Dependencies: 278
-- Data for Name: families; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.families (id, owner_id, name, created_at, updated_at, deleted_at) FROM stdin;
1	98344918-f676-4f47-9ad9-cdcd913aeb1b	\N	2025-05-16 13:58:44.328624+03	\N	\N
\.


--
-- TOC entry 5250 (class 0 OID 25107)
-- Dependencies: 280
-- Data for Name: family_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.family_members (id, family_id, user_id, short_name, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5197 (class 0 OID 24673)
-- Dependencies: 227
-- Data for Name: feed_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.feed_types (id, name) FROM stdin;
1	Монопротеиновый
2	Гипоаллергенный
3	Беззерновой
4	Для щенков
5	Для взрослых собак
6	Для пожилых собак
7	Для активных собак
8	Для собак с избыточным весом
9	Для стерилизованных/кастрированных собак
10	Сухой корм
11	Влажный корм
12	Натуральный корм
13	Для собак с чувствительным пищеварением
14	Для собак с заболеваниями суставов
15	Для собак с проблемами кожи и шерсти
16	Для собак с заболеваниями почек
\.


--
-- TOC entry 5188 (class 0 OID 16417)
-- Dependencies: 218
-- Data for Name: frequency; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.frequency (id, name) FROM stdin;
1	Каждый день
2	Раз в неделю
\.


--
-- TOC entry 5199 (class 0 OID 24687)
-- Dependencies: 229
-- Data for Name: injuries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.injuries (id, name, description, pet_id, injury_date, created_at, updated_at, deleted_at) FROM stdin;
1	Узи внутренних органов	Были обнаружены гельминты в легких	3	2024-08-25 13:10:14.07	2025-03-25 13:12:31.658304	2025-03-25 13:12:31.658304	2025-03-25 13:14:37.260086
\.


--
-- TOC entry 5195 (class 0 OID 24659)
-- Dependencies: 225
-- Data for Name: med_cards; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.med_cards (id, pet_id, weight, allergies, feed_type_id, feeding_frequency, ingredients, serving_size, features_of_care, created_at, updated_at, deleted_at) FROM stdin;
2	3	12	Говядина	1	4	Кролик	50	В качестве лакомства ест легкое кролика	\N	\N	\N
\.


--
-- TOC entry 5224 (class 0 OID 24893)
-- Dependencies: 254
-- Data for Name: medicine_tracking; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medicine_tracking (id, medicine_id, status, description, created_at, updated_at, deleted_at, date) FROM stdin;
1	1	1	\N	2025-04-25 19:35:49.078574	\N	\N	2025-04-03 00:00:00
10	1	0		2025-05-16 12:39:32.94864	\N	\N	2025-05-07 00:00:00
11	2	0		2025-05-16 12:57:55.177353	\N	\N	2025-05-03 00:00:00
12	1	0		2025-05-18 18:46:14.802581	\N	\N	2025-05-11 00:00:00
\.


--
-- TOC entry 5222 (class 0 OID 24858)
-- Dependencies: 252
-- Data for Name: medicines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medicines (id, name, description, dosage, created_at, updated_at, deleted_at, pet_id) FROM stdin;
1	Тест	Раз в день	2 гр	2025-04-25 19:32:12.86215	\N	\N	3
2	Милпразон		2 гр	2025-05-16 12:57:06.940772	\N	\N	3
\.


--
-- TOC entry 5217 (class 0 OID 24832)
-- Dependencies: 247
-- Data for Name: pet_activities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pet_activities (pet_id, activity_type_id, duration_minutes, distance_km, description, created_at, updated_at, deleted_at, id) FROM stdin;
3	1	30	2	\N	2025-04-23 12:20:05.385905	\N	\N	1
3	1	40	3		2025-04-25 15:38:52.020894	\N	\N	2
3	4	20	\N		2025-04-25 15:39:00.080799	\N	\N	3
3	1	20	3		2025-05-16 13:03:37.492736	\N	\N	4
3	4	22	\N		2025-05-16 13:03:52.23665	\N	\N	5
\.


--
-- TOC entry 5238 (class 0 OID 25015)
-- Dependencies: 268
-- Data for Name: pet_photos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pet_photos (id, pet_id, photo_url, is_primary, upload_date, deleted_at) FROM stdin;
2	1	/src/assets/pets/baron.png	t	2025-05-06 13:02:56.408336+03	\N
3	2	/src/assets/pets/jain.png	t	2025-05-06 19:16:10.707268+03	\N
\.


--
-- TOC entry 5193 (class 0 OID 24630)
-- Dependencies: 223
-- Data for Name: pets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pets (id, breed_id, birth_date, logo_url, name, stigma, microchip, description, user_id, created_at, updated_at, deleted_at) FROM stdin;
2	23	2024-04-27 15:30:52.673	\N	Ноби	BKU15008	\N	Маленький пройдоха	98344918-f676-4f47-9ad9-cdcd913aeb1b	2025-03-23 18:23:27.728202	\N	2025-03-23 18:55:17.545404
4	46	2025-03-14 03:00:00	\N	Арчи			Сладкая булка	98344918-f676-4f47-9ad9-cdcd913aeb1b	2025-03-24 10:06:01.408035	\N	2025-04-30 20:54:31.532591
3	23	2024-04-27 03:00:00	/src/assets/logos/golden.png	Ноби	BKU15008		Сладкая булка	98344918-f676-4f47-9ad9-cdcd913aeb1b	2025-03-23 18:55:40.525542	\N	\N
\.


--
-- TOC entry 5226 (class 0 OID 24920)
-- Dependencies: 256
-- Data for Name: reminder_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reminder_categories (id, name, description, color, created_at, updated_at, deleted_at) FROM stdin;
1	Здоровье	Не забыть о визитах к ветеринару, приеме лекарств и вакцинации		2025-05-03 10:38:09.270831+03	2025-05-03 10:38:09.270831+03	\N
2	Гигиена	Записаться на груминг или напомнить о плановом купании		2025-05-03 10:38:09.270831+03	2025-05-03 10:38:09.270831+03	\N
3	Покупки	Не забыть ничего важного		2025-05-03 10:38:09.270831+03	2025-05-03 10:38:09.270831+03	\N
4	Воспитание	Не пропустить дрессировки и встречи с кинологом		2025-05-03 10:38:09.270831+03	2025-05-03 10:38:09.270831+03	\N
\.


--
-- TOC entry 5228 (class 0 OID 24931)
-- Dependencies: 258
-- Data for Name: reminders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reminders (id, title, description, start_time, end_time, date, importance_level, category_id, user_id, created_at, updated_at, deleted_at) FROM stdin;
2	string	string	18:30:00	\N	2025-05-03	0	2	98344918-f676-4f47-9ad9-cdcd913aeb1b	2025-05-03 10:53:07.619222+03	2025-05-03 10:53:07.619222+03	2025-05-03 11:03:52.094022+03
3	Милпразон		12:00:00	\N	2025-05-30	3	\N	98344918-f676-4f47-9ad9-cdcd913aeb1b	2025-05-03 11:30:19.145351+03	2025-05-03 11:30:19.145351+03	\N
4	Милпразон		12:00:00	\N	2025-05-03	3	\N	98344918-f676-4f47-9ad9-cdcd913aeb1b	2025-05-03 11:31:54.911894+03	2025-05-03 11:31:54.911894+03	\N
5	Обработка от клещей		12:00:00	\N	2025-05-04	3	1	98344918-f676-4f47-9ad9-cdcd913aeb1b	2025-05-03 11:40:45.637929+03	2025-05-03 11:40:45.637929+03	\N
1	Блэкгрумер оформление лап	Попросить подстричь шерсть под лапками	18:30:00	19:30:00	2025-05-03	0	2	98344918-f676-4f47-9ad9-cdcd913aeb1b	2025-05-03 10:52:57.77317+03	2025-05-03 11:18:04.489971+03	2025-05-03 11:41:13.455356+03
6	Таблетка		12:00:00	\N	2025-05-14	3	4	98344918-f676-4f47-9ad9-cdcd913aeb1b	2025-05-14 20:11:46.655124+03	2025-05-14 20:11:46.655124+03	\N
7	Таблетка		12:00:00	20:25:00	2025-05-14	3	\N	98344918-f676-4f47-9ad9-cdcd913aeb1b	2025-05-14 20:23:12.155655+03	2025-05-14 20:23:48.780917+03	2025-05-14 20:30:04.634835+03
8	Тренировки с кинологом Анастасией		12:00:00	\N	2025-05-31	2	4	98344918-f676-4f47-9ad9-cdcd913aeb1b	2025-05-14 20:38:50.531441+03	2025-05-14 20:38:50.531441+03	\N
9	Тренировка с кинологом Анастасией		15:00:00	\N	2025-05-15	3	4	98344918-f676-4f47-9ad9-cdcd913aeb1b	2025-05-14 20:39:18.198372+03	2025-05-14 20:39:18.198372+03	\N
10	Милпразон		15:00:00	\N	2025-05-17	2	2	98344918-f676-4f47-9ad9-cdcd913aeb1b	2025-05-16 12:15:23.227404+03	2025-05-16 12:15:23.227404+03	\N
\.


--
-- TOC entry 5236 (class 0 OID 24976)
-- Dependencies: 266
-- Data for Name: shelter_pets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shelter_pets (id, shelter_id, breed_id, name, age_months, size_id, gender_id, weight, color, description, personality, health_status, vaccination_status, sterilization_status, adoption_status_id, created_at, updated_at, deleted_at) FROM stdin;
1	1	81	Барон	18	3	1	32.50	палевый	Дружелюбный лабрадор с отличным характером. Знает базовые команды.	Очень общительный, любит играть, хорошо ладит с другими животными	Здоров, все прививки по возрасту	t	t	1	2025-05-06 10:35:42.497807+03	2025-05-06 10:35:42.497807+03	\N
2	2	23	Джесси	9	2	2	12.00	трехцветный	Молодая активная собака, ищет семью для активного образа жизни.	Энергичная, любознательная, любит длительные прогулки	Здорова, требуется повторная вакцинация через 3 месяца	t	f	1	2025-05-06 10:35:46.963216+03	2025-05-06 10:35:46.963216+03	\N
\.


--
-- TOC entry 5211 (class 0 OID 24779)
-- Dependencies: 241
-- Data for Name: shelters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shelters (id, name, address, coords, description, logo_url, owner_user_id, created_at, updated_at, deleted_at, website_url, phone_number, email, working_hours) FROM stdin;
2	Лучший друг	Санкт-Петербург, пр. Науки, 12к1	{60.0127,30.3945}	Приют с профессиональными кинологами и ветеринарами	https://static.tildacdn.com/tild6661-6361-4434-a439-613137653265/2022-11-10_211616.jpg	b270843b-54b5-4d88-8591-a06b62efd1a4	\N	\N	\N	\N	\N	\N	\N
1	Помощь бездомным животным	Санкт-Петербург, ул. Фрунзе, 16	{59.8575,30.3194}	Крупный приют для собак и кошек, принимает волонтеров	\N	501a1d66-7c41-446c-9fe7-e1aa09156884	\N	\N	\N	\N	\N	\N	\N
\.


--
-- TOC entry 5244 (class 0 OID 25064)
-- Dependencies: 274
-- Data for Name: tariffs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tariffs (id, name, description, max_pets, max_family_members, price, is_active, created_at, updated_at, deleted_at) FROM stdin;
1	Бесплатный	Базовые возможности для одного пользователя	1	0	0.00	t	2025-05-14 18:54:47.914286+03	2025-05-14 18:54:47.914286+03	\N
2	PRO	Расширенные возможности для семьи	5	3	299.00	t	2025-05-14 18:54:54.984157+03	2025-05-14 18:54:54.984157+03	\N
3	Семейный	Полный доступ для большой семьи	10	10	599.00	t	2025-05-14 18:55:05.4585+03	2025-05-14 18:55:05.4585+03	\N
\.


--
-- TOC entry 5213 (class 0 OID 24798)
-- Dependencies: 243
-- Data for Name: traffic_points; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.traffic_points (id, coords, user_id, created_at, updated_at, deleted_at, activity_time) FROM stdin;
1	{59.942116,30.388304}	98344918-f676-4f47-9ad9-cdcd913aeb1b	2025-03-26 14:24:41.794491	2025-03-26 14:24:41.794491	\N	12:00:00
2	{55.76996434026855,37.59342539697265}	98344918-f676-4f47-9ad9-cdcd913aeb1b	2025-05-07 12:28:55.570538	2025-05-07 12:28:55.570538	\N	12:00:00
3	{55.77364136320726,37.63153422265624}	98344918-f676-4f47-9ad9-cdcd913aeb1b	2025-05-07 12:32:05.184469	2025-05-07 12:32:05.184469	\N	12:00:00
4	{59.94036553325635,30.33643504723253}	98344918-f676-4f47-9ad9-cdcd913aeb1b	2025-05-07 12:40:45.33006	2025-05-07 12:40:45.33006	\N	14:42:00
5	{59.94431459704764,30.376043061694002}	98344918-f676-4f47-9ad9-cdcd913aeb1b	2025-05-07 12:43:29.21288	2025-05-07 12:43:29.21288	\N	14:45:00
6	{55.78099436411413,37.61505473046874}	98344918-f676-4f47-9ad9-cdcd913aeb1b	2025-05-07 12:45:54.079858	2025-05-07 12:45:54.079858	\N	16:49:00
7	{59.9254959270141,30.504453068296925}	98344918-f676-4f47-9ad9-cdcd913aeb1b	2025-05-18 18:18:26.019961	2025-05-18 18:18:26.019961	\N	15:18:00
8	{59.95890449406768,30.509945468511223}	98344918-f676-4f47-9ad9-cdcd913aeb1b	2025-05-18 18:39:31.415048	2025-05-18 18:39:31.415048	\N	20:40:00
\.


--
-- TOC entry 5207 (class 0 OID 24756)
-- Dependencies: 237
-- Data for Name: treatment_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.treatment_types (id, name) FROM stdin;
1	Обработка от гельминтов
2	Обработка от блох и клещей
3	Вакцинация
4	Чипирование
5	Стерилизация/кастрация
6	Лечение ушных инфекций
7	Лечение глазных инфекций
8	Стоматологическая обработка
9	Витамины
10	Антибиотик
11	Обезболивающая терапия
12	Капельницы
13	Обработка от кожных паразитов
14	Лечение аллергических реакций
15	Гормональная терапия
\.


--
-- TOC entry 5205 (class 0 OID 24721)
-- Dependencies: 235
-- Data for Name: treatments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.treatments (id, pet_id, description, treatment_type_id, treatment_date, created_at, updated_at, deleted_at) FROM stdin;
2	3	Милпразон	1	2025-03-25 11:56:15.527	2025-03-25 12:02:56.343746	2025-03-25 12:02:56.343746	\N
1	3	Милпразон	1	2025-03-25 11:56:15.527	2025-03-25 11:56:52.309878	2025-03-25 11:56:52.309878	2025-03-25 12:56:07.750653
\.


--
-- TOC entry 5246 (class 0 OID 25075)
-- Dependencies: 276
-- Data for Name: user_subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_subscriptions (id, user_id, tariff_id, start_date, end_date, is_active, created_at, updated_at, deleted_at) FROM stdin;
1	98344918-f676-4f47-9ad9-cdcd913aeb1b	2	2025-05-14 19:02:51.671657+03	2025-06-13 19:02:51.671657+03	f	2025-05-14 19:02:51.671657+03	2025-05-14 19:02:56.320528+03	\N
2	98344918-f676-4f47-9ad9-cdcd913aeb1b	3	2025-05-14 19:02:56.320528+03	2025-06-13 19:02:56.320528+03	f	2025-05-14 19:02:56.320528+03	2025-05-14 19:03:02.933919+03	\N
3	98344918-f676-4f47-9ad9-cdcd913aeb1b	1	2025-05-14 19:03:02.933919+03	2025-06-13 19:03:02.933919+03	f	2025-05-14 19:03:02.933919+03	2025-05-14 19:16:05.790515+03	\N
4	98344918-f676-4f47-9ad9-cdcd913aeb1b	2	2025-05-14 19:16:05.790515+03	2025-06-13 19:16:05.790515+03	f	2025-05-14 19:16:05.790515+03	2025-05-14 19:20:31.007054+03	\N
5	98344918-f676-4f47-9ad9-cdcd913aeb1b	3	2025-05-14 19:20:35.310881+03	2025-06-13 19:20:35.310881+03	f	2025-05-14 19:20:35.310881+03	2025-05-15 14:10:13.144108+03	\N
6	98344918-f676-4f47-9ad9-cdcd913aeb1b	2	2025-05-15 14:10:40.987617+03	2025-06-14 14:10:40.987617+03	f	2025-05-15 14:10:40.987617+03	2025-05-15 14:57:12.887395+03	\N
7	98344918-f676-4f47-9ad9-cdcd913aeb1b	3	2025-05-15 14:57:20.398338+03	2025-06-14 14:57:20.398338+03	f	2025-05-15 14:57:20.398338+03	2025-05-18 18:46:28.841728+03	\N
8	98344918-f676-4f47-9ad9-cdcd913aeb1b	2	2025-05-18 18:46:33.499684+03	2025-06-17 18:46:33.499684+03	t	2025-05-18 18:46:33.499684+03	\N	\N
\.


--
-- TOC entry 5189 (class 0 OID 16425)
-- Dependencies: 219
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password_hash, name, role, logo_url, refresh_token, refresh_token_expiry_time, created_at, updated_at, deleted_at) FROM stdin;
98344918-f676-4f47-9ad9-cdcd913aeb1b	liretmat@gmail.com	$2a$11$dyXDlZCxYLyqLfRzc7eik.qJCrnt3lXliYoFG.GYSQQWinG3phC7y	Аля	user	\N	108d7e13-3b82-47ae-a908-289f83a0121e	2025-05-25 18:46:48.708229	2025-03-22 14:17:02.552409	2025-05-18 18:46:48.70825	\N
501a1d66-7c41-446c-9fe7-e1aa09156884	helphomelesspet@mail.ru	$2a$11$gSL1TRAD9Zi8cNx2FaZWmeU9Yv9SKeGPtCOU/wlFwqoxwucva9qmu	Анна Иванова (Администратор приюта)	user	\N	\N	\N	2025-05-06 09:17:36.934418	2025-05-06 09:17:36.934503	\N
b270843b-54b5-4d88-8591-a06b62efd1a4	bestfriend@mail.ru	$2a$11$SU.u9KRHTFk/SRuW0jjv8eV3YNWKy2UEcF3siSdWSCsTUp0jkoxTe	Виталий Колесов (Владелец)	user	\N	\N	\N	2025-05-06 09:19:32.210498	2025-05-06 09:19:32.210499	\N
\.


--
-- TOC entry 5203 (class 0 OID 24705)
-- Dependencies: 233
-- Data for Name: vaccinations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vaccinations (id, pet_id, name, vaccination_date, description, created_at, updated_at, deleted_at) FROM stdin;
1	3	От бешенства	2024-08-25 13:10:14.07	Нобивак	2025-03-25 17:56:02.696181	2025-03-25 17:56:02.696181	2025-03-25 17:57:45.293032
\.


--
-- TOC entry 5219 (class 0 OID 24841)
-- Dependencies: 249
-- Data for Name: weight_measurements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.weight_measurements (id, pet_id, weight_kg, created_at, updated_at, deleted_at) FROM stdin;
1	3	11	2025-04-25 13:48:30.14436	\N	\N
2	3	12	2025-04-25 13:48:37.262233	\N	\N
3	3	13	2025-05-16 13:06:51.691931	\N	\N
4	3	11	2025-05-16 13:09:39.82077	\N	\N
\.


--
-- TOC entry 5287 (class 0 OID 0)
-- Dependencies: 245
-- Name: activity_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.activity_types_id_seq', 4, true);


--
-- TOC entry 5288 (class 0 OID 0)
-- Dependencies: 263
-- Name: adoption_statuses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.adoption_statuses_id_seq', 5, true);


--
-- TOC entry 5289 (class 0 OID 0)
-- Dependencies: 261
-- Name: animal_genders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.animal_genders_id_seq', 2, true);


--
-- TOC entry 5290 (class 0 OID 0)
-- Dependencies: 259
-- Name: animal_sizes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.animal_sizes_id_seq', 3, true);


--
-- TOC entry 5291 (class 0 OID 0)
-- Dependencies: 269
-- Name: article_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.article_categories_id_seq', 4, true);


--
-- TOC entry 5292 (class 0 OID 0)
-- Dependencies: 271
-- Name: articles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.articles_id_seq', 18, true);


--
-- TOC entry 5293 (class 0 OID 0)
-- Dependencies: 220
-- Name: breeds_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.breeds_id_seq', 149, true);


--
-- TOC entry 5294 (class 0 OID 0)
-- Dependencies: 230
-- Name: chronic_diseases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.chronic_diseases_id_seq', 1, true);


--
-- TOC entry 5295 (class 0 OID 0)
-- Dependencies: 238
-- Name: danger_points_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.danger_points_id_seq', 7, true);


--
-- TOC entry 5296 (class 0 OID 0)
-- Dependencies: 277
-- Name: families_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.families_id_seq', 1, true);


--
-- TOC entry 5297 (class 0 OID 0)
-- Dependencies: 279
-- Name: family_members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.family_members_id_seq', 1, false);


--
-- TOC entry 5298 (class 0 OID 0)
-- Dependencies: 226
-- Name: feed_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.feed_types_id_seq', 16, true);


--
-- TOC entry 5299 (class 0 OID 0)
-- Dependencies: 217
-- Name: frequency _id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."frequency _id_seq"', 2, true);


--
-- TOC entry 5300 (class 0 OID 0)
-- Dependencies: 228
-- Name: injuries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.injuries_id_seq', 1, true);


--
-- TOC entry 5301 (class 0 OID 0)
-- Dependencies: 224
-- Name: med_cards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.med_cards_id_seq', 3, true);


--
-- TOC entry 5302 (class 0 OID 0)
-- Dependencies: 253
-- Name: medicine_tracking_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.medicine_tracking_id_seq', 12, true);


--
-- TOC entry 5303 (class 0 OID 0)
-- Dependencies: 251
-- Name: medicines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.medicines_id_seq', 2, true);


--
-- TOC entry 5304 (class 0 OID 0)
-- Dependencies: 250
-- Name: pet_activities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pet_activities_id_seq', 5, true);


--
-- TOC entry 5305 (class 0 OID 0)
-- Dependencies: 267
-- Name: pet_photos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pet_photos_id_seq', 3, true);


--
-- TOC entry 5306 (class 0 OID 0)
-- Dependencies: 222
-- Name: pets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pets_id_seq', 4, true);


--
-- TOC entry 5307 (class 0 OID 0)
-- Dependencies: 255
-- Name: reminder_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reminder_categories_id_seq', 4, true);


--
-- TOC entry 5308 (class 0 OID 0)
-- Dependencies: 257
-- Name: reminders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reminders_id_seq', 10, true);


--
-- TOC entry 5309 (class 0 OID 0)
-- Dependencies: 265
-- Name: shelter_pets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.shelter_pets_id_seq', 2, true);


--
-- TOC entry 5310 (class 0 OID 0)
-- Dependencies: 240
-- Name: shelters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.shelters_id_seq', 2, true);


--
-- TOC entry 5311 (class 0 OID 0)
-- Dependencies: 273
-- Name: tariffs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tariffs_id_seq', 1, false);


--
-- TOC entry 5312 (class 0 OID 0)
-- Dependencies: 242
-- Name: traffic_points_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.traffic_points_id_seq', 8, true);


--
-- TOC entry 5313 (class 0 OID 0)
-- Dependencies: 236
-- Name: treatment_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.treatment_types_id_seq', 15, true);


--
-- TOC entry 5314 (class 0 OID 0)
-- Dependencies: 234
-- Name: treatments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.treatments_id_seq', 2, true);


--
-- TOC entry 5315 (class 0 OID 0)
-- Dependencies: 275
-- Name: user_subscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_subscriptions_id_seq', 8, true);


--
-- TOC entry 5316 (class 0 OID 0)
-- Dependencies: 232
-- Name: vaccinations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vaccinations_id_seq', 1, true);


--
-- TOC entry 5317 (class 0 OID 0)
-- Dependencies: 248
-- Name: weight_measurements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.weight_measurements_id_seq', 4, true);


--
-- TOC entry 4970 (class 2606 OID 24831)
-- Name: activity_types activity_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_types
    ADD CONSTRAINT activity_types_pkey PRIMARY KEY (id);


--
-- TOC entry 4993 (class 2606 OID 24973)
-- Name: adoption_statuses adoption_statuses_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adoption_statuses
    ADD CONSTRAINT adoption_statuses_name_key UNIQUE (name);


--
-- TOC entry 4995 (class 2606 OID 24971)
-- Name: adoption_statuses adoption_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adoption_statuses
    ADD CONSTRAINT adoption_statuses_pkey PRIMARY KEY (id);


--
-- TOC entry 4989 (class 2606 OID 24964)
-- Name: animal_genders animal_genders_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animal_genders
    ADD CONSTRAINT animal_genders_name_key UNIQUE (name);


--
-- TOC entry 4991 (class 2606 OID 24962)
-- Name: animal_genders animal_genders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animal_genders
    ADD CONSTRAINT animal_genders_pkey PRIMARY KEY (id);


--
-- TOC entry 4985 (class 2606 OID 24955)
-- Name: animal_sizes animal_sizes_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animal_sizes
    ADD CONSTRAINT animal_sizes_name_key UNIQUE (name);


--
-- TOC entry 4987 (class 2606 OID 24953)
-- Name: animal_sizes animal_sizes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animal_sizes
    ADD CONSTRAINT animal_sizes_pkey PRIMARY KEY (id);


--
-- TOC entry 5001 (class 2606 OID 25038)
-- Name: article_categories article_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.article_categories
    ADD CONSTRAINT article_categories_pkey PRIMARY KEY (id);


--
-- TOC entry 5003 (class 2606 OID 25040)
-- Name: article_categories article_categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.article_categories
    ADD CONSTRAINT article_categories_slug_key UNIQUE (slug);


--
-- TOC entry 5005 (class 2606 OID 25052)
-- Name: articles articles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_pkey PRIMARY KEY (id);


--
-- TOC entry 5007 (class 2606 OID 25054)
-- Name: articles articles_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_slug_key UNIQUE (slug);


--
-- TOC entry 4943 (class 2606 OID 24628)
-- Name: breeds breeds_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.breeds
    ADD CONSTRAINT breeds_pkey PRIMARY KEY (id);


--
-- TOC entry 4953 (class 2606 OID 24703)
-- Name: chronic_diseases chronic_diseases_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chronic_diseases
    ADD CONSTRAINT chronic_diseases_pkey PRIMARY KEY (id);


--
-- TOC entry 4961 (class 2606 OID 24777)
-- Name: danger_points danger_points_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.danger_points
    ADD CONSTRAINT danger_points_pkey PRIMARY KEY (id);


--
-- TOC entry 4967 (class 2606 OID 24815)
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- TOC entry 5013 (class 2606 OID 25100)
-- Name: families families_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.families
    ADD CONSTRAINT families_pkey PRIMARY KEY (id);


--
-- TOC entry 5015 (class 2606 OID 25115)
-- Name: family_members family_members_family_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.family_members
    ADD CONSTRAINT family_members_family_id_user_id_key UNIQUE (family_id, user_id);


--
-- TOC entry 5017 (class 2606 OID 25113)
-- Name: family_members family_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.family_members
    ADD CONSTRAINT family_members_pkey PRIMARY KEY (id);


--
-- TOC entry 4949 (class 2606 OID 24680)
-- Name: feed_types feed_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feed_types
    ADD CONSTRAINT feed_types_pkey PRIMARY KEY (id);


--
-- TOC entry 4937 (class 2606 OID 16424)
-- Name: frequency frequency _pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frequency
    ADD CONSTRAINT "frequency _pkey" PRIMARY KEY (id);


--
-- TOC entry 4951 (class 2606 OID 24694)
-- Name: injuries injuries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.injuries
    ADD CONSTRAINT injuries_pkey PRIMARY KEY (id);


--
-- TOC entry 4947 (class 2606 OID 24666)
-- Name: med_cards med_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.med_cards
    ADD CONSTRAINT med_cards_pkey PRIMARY KEY (id);


--
-- TOC entry 4979 (class 2606 OID 24902)
-- Name: medicine_tracking medicine_tracking_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicine_tracking
    ADD CONSTRAINT medicine_tracking_pkey PRIMARY KEY (id);


--
-- TOC entry 4976 (class 2606 OID 24866)
-- Name: medicines medicines_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicines
    ADD CONSTRAINT medicines_pkey PRIMARY KEY (id);


--
-- TOC entry 4972 (class 2606 OID 24856)
-- Name: pet_activities pet_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pet_activities
    ADD CONSTRAINT pet_activities_pkey PRIMARY KEY (id);


--
-- TOC entry 4999 (class 2606 OID 25024)
-- Name: pet_photos pet_photos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pet_photos
    ADD CONSTRAINT pet_photos_pkey PRIMARY KEY (id);


--
-- TOC entry 4945 (class 2606 OID 24637)
-- Name: pets pets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pets
    ADD CONSTRAINT pets_pkey PRIMARY KEY (id);


--
-- TOC entry 4981 (class 2606 OID 24929)
-- Name: reminder_categories reminder_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reminder_categories
    ADD CONSTRAINT reminder_categories_pkey PRIMARY KEY (id);


--
-- TOC entry 4983 (class 2606 OID 24941)
-- Name: reminders reminders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reminders
    ADD CONSTRAINT reminders_pkey PRIMARY KEY (id);


--
-- TOC entry 4997 (class 2606 OID 24988)
-- Name: shelter_pets shelter_pets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shelter_pets
    ADD CONSTRAINT shelter_pets_pkey PRIMARY KEY (id);


--
-- TOC entry 4963 (class 2606 OID 24786)
-- Name: shelters shelters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shelters
    ADD CONSTRAINT shelters_pkey PRIMARY KEY (id);


--
-- TOC entry 5009 (class 2606 OID 25073)
-- Name: tariffs tariffs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tariffs
    ADD CONSTRAINT tariffs_pkey PRIMARY KEY (id);


--
-- TOC entry 4965 (class 2606 OID 24806)
-- Name: traffic_points traffic_points_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.traffic_points
    ADD CONSTRAINT traffic_points_pkey PRIMARY KEY (id);


--
-- TOC entry 4959 (class 2606 OID 24763)
-- Name: treatment_types treatment_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.treatment_types
    ADD CONSTRAINT treatment_types_pkey PRIMARY KEY (id);


--
-- TOC entry 4957 (class 2606 OID 24728)
-- Name: treatments treatments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.treatments
    ADD CONSTRAINT treatments_pkey PRIMARY KEY (id);


--
-- TOC entry 5011 (class 2606 OID 25082)
-- Name: user_subscriptions user_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_pkey PRIMARY KEY (id);


--
-- TOC entry 4939 (class 2606 OID 16437)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4941 (class 2606 OID 16435)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4955 (class 2606 OID 24712)
-- Name: vaccinations vaccinations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vaccinations
    ADD CONSTRAINT vaccinations_pkey PRIMARY KEY (id);


--
-- TOC entry 4974 (class 2606 OID 24847)
-- Name: weight_measurements weight_measurements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weight_measurements
    ADD CONSTRAINT weight_measurements_pkey PRIMARY KEY (id);


--
-- TOC entry 4968 (class 1259 OID 24821)
-- Name: idx_documents_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_documents_user ON public.documents USING btree (user_id);


--
-- TOC entry 4977 (class 1259 OID 24915)
-- Name: idx_medicine_tracking_medicine_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_medicine_tracking_medicine_id ON public.medicine_tracking USING btree (medicine_id);


--
-- TOC entry 5036 (class 2606 OID 25055)
-- Name: articles articles_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.article_categories(id);


--
-- TOC entry 5018 (class 2606 OID 24643)
-- Name: pets breed_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pets
    ADD CONSTRAINT breed_id FOREIGN KEY (breed_id) REFERENCES public.breeds(id) NOT VALID;


--
-- TOC entry 5028 (class 2606 OID 24816)
-- Name: documents documents_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 5039 (class 2606 OID 25101)
-- Name: families families_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.families
    ADD CONSTRAINT families_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- TOC entry 5040 (class 2606 OID 25116)
-- Name: family_members family_members_family_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.family_members
    ADD CONSTRAINT family_members_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.families(id);


--
-- TOC entry 5041 (class 2606 OID 25121)
-- Name: family_members family_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.family_members
    ADD CONSTRAINT family_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 5020 (class 2606 OID 24681)
-- Name: med_cards feed_type_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.med_cards
    ADD CONSTRAINT feed_type_id FOREIGN KEY (feed_type_id) REFERENCES public.feed_types(id) NOT VALID;


--
-- TOC entry 5029 (class 2606 OID 24905)
-- Name: medicine_tracking medicine_tracking_medicine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicine_tracking
    ADD CONSTRAINT medicine_tracking_medicine_id_fkey FOREIGN KEY (medicine_id) REFERENCES public.medicines(id);


--
-- TOC entry 5021 (class 2606 OID 24667)
-- Name: med_cards pet_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.med_cards
    ADD CONSTRAINT pet_id FOREIGN KEY (pet_id) REFERENCES public.pets(id) NOT VALID;


--
-- TOC entry 5022 (class 2606 OID 24729)
-- Name: injuries pet_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.injuries
    ADD CONSTRAINT pet_id FOREIGN KEY (pet_id) REFERENCES public.pets(id) NOT VALID;


--
-- TOC entry 5023 (class 2606 OID 24734)
-- Name: chronic_diseases pet_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chronic_diseases
    ADD CONSTRAINT pet_id FOREIGN KEY (pet_id) REFERENCES public.pets(id) NOT VALID;


--
-- TOC entry 5024 (class 2606 OID 24739)
-- Name: vaccinations pet_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vaccinations
    ADD CONSTRAINT pet_id FOREIGN KEY (pet_id) REFERENCES public.pets(id) NOT VALID;


--
-- TOC entry 5025 (class 2606 OID 24744)
-- Name: treatments pet_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.treatments
    ADD CONSTRAINT pet_id FOREIGN KEY (pet_id) REFERENCES public.pets(id) NOT VALID;


--
-- TOC entry 5030 (class 2606 OID 24942)
-- Name: reminders reminders_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reminders
    ADD CONSTRAINT reminders_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.reminder_categories(id);


--
-- TOC entry 5031 (class 2606 OID 25009)
-- Name: shelter_pets shelter_pets_adoption_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shelter_pets
    ADD CONSTRAINT shelter_pets_adoption_status_id_fkey FOREIGN KEY (adoption_status_id) REFERENCES public.adoption_statuses(id);


--
-- TOC entry 5032 (class 2606 OID 24994)
-- Name: shelter_pets shelter_pets_breed_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shelter_pets
    ADD CONSTRAINT shelter_pets_breed_id_fkey FOREIGN KEY (breed_id) REFERENCES public.breeds(id);


--
-- TOC entry 5033 (class 2606 OID 25004)
-- Name: shelter_pets shelter_pets_gender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shelter_pets
    ADD CONSTRAINT shelter_pets_gender_id_fkey FOREIGN KEY (gender_id) REFERENCES public.animal_genders(id);


--
-- TOC entry 5034 (class 2606 OID 24989)
-- Name: shelter_pets shelter_pets_shelter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shelter_pets
    ADD CONSTRAINT shelter_pets_shelter_id_fkey FOREIGN KEY (shelter_id) REFERENCES public.shelters(id) ON DELETE CASCADE;


--
-- TOC entry 5035 (class 2606 OID 24999)
-- Name: shelter_pets shelter_pets_size_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shelter_pets
    ADD CONSTRAINT shelter_pets_size_id_fkey FOREIGN KEY (size_id) REFERENCES public.animal_sizes(id);


--
-- TOC entry 5026 (class 2606 OID 24764)
-- Name: treatments treatment_type_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.treatments
    ADD CONSTRAINT treatment_type_id FOREIGN KEY (treatment_type_id) REFERENCES public.treatment_types(id) NOT VALID;


--
-- TOC entry 5019 (class 2606 OID 24638)
-- Name: pets user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pets
    ADD CONSTRAINT user_id FOREIGN KEY (user_id) REFERENCES public.users(id) NOT VALID;


--
-- TOC entry 5027 (class 2606 OID 24787)
-- Name: danger_points user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.danger_points
    ADD CONSTRAINT user_id FOREIGN KEY (user_id) REFERENCES public.users(id) NOT VALID;


--
-- TOC entry 5037 (class 2606 OID 25088)
-- Name: user_subscriptions user_subscriptions_tariff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_tariff_id_fkey FOREIGN KEY (tariff_id) REFERENCES public.tariffs(id);


--
-- TOC entry 5038 (class 2606 OID 25083)
-- Name: user_subscriptions user_subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


-- Completed on 2025-05-27 00:01:39

--
-- PostgreSQL database dump complete
--

