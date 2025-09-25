--
-- PostgreSQL database dump
--

-- Dumped from database version 12.22 (Ubuntu 12.22-0ubuntu0.20.04.4)
-- Dumped by pg_dump version 12.22 (Ubuntu 12.22-0ubuntu0.20.04.4)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: gym
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN NEW."updatedAt" := now(); RETURN NEW; END; $$;


ALTER FUNCTION public.set_updated_at() OWNER TO gym;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Exercise; Type: TABLE; Schema: public; Owner: gym
--

CREATE TABLE public."Exercise" (
    id text NOT NULL,
    "workoutDayId" text NOT NULL,
    "order" integer NOT NULL,
    "nameGr" text NOT NULL,
    "nameEn" text,
    "deletedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."Exercise" OWNER TO gym;

--
-- Name: Set; Type: TABLE; Schema: public; Owner: gym
--

CREATE TABLE public."Set" (
    id text NOT NULL,
    "exerciseId" text NOT NULL,
    "order" integer NOT NULL,
    kg double precision,
    reps integer,
    notes text,
    "deletedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."Set" OWNER TO gym;

--
-- Name: User; Type: TABLE; Schema: public; Owner: gym
--

CREATE TABLE public."User" (
    id text NOT NULL,
    username text NOT NULL,
    email text,
    name text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO gym;

--
-- Name: WorkoutDay; Type: TABLE; Schema: public; Owner: gym
--

CREATE TABLE public."WorkoutDay" (
    id text NOT NULL,
    "userId" text,
    date timestamp(3) without time zone NOT NULL,
    program text NOT NULL,
    notes text,
    "deletedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."WorkoutDay" OWNER TO gym;

--
-- Name: Exercise Exercise_pkey; Type: CONSTRAINT; Schema: public; Owner: gym
--

ALTER TABLE ONLY public."Exercise"
    ADD CONSTRAINT "Exercise_pkey" PRIMARY KEY (id);


--
-- Name: Set Set_pkey; Type: CONSTRAINT; Schema: public; Owner: gym
--

ALTER TABLE ONLY public."Set"
    ADD CONSTRAINT "Set_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: gym
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: WorkoutDay WorkoutDay_pkey; Type: CONSTRAINT; Schema: public; Owner: gym
--

ALTER TABLE ONLY public."WorkoutDay"
    ADD CONSTRAINT "WorkoutDay_pkey" PRIMARY KEY (id);


--
-- Name: Exercise_workoutDayId_order_idx; Type: INDEX; Schema: public; Owner: gym
--

CREATE INDEX "Exercise_workoutDayId_order_idx" ON public."Exercise" USING btree ("workoutDayId", "order");


--
-- Name: Set_exerciseId_order_idx; Type: INDEX; Schema: public; Owner: gym
--

CREATE INDEX "Set_exerciseId_order_idx" ON public."Set" USING btree ("exerciseId", "order");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: gym
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_username_key; Type: INDEX; Schema: public; Owner: gym
--

CREATE UNIQUE INDEX "User_username_key" ON public."User" USING btree (username);


--
-- Name: WorkoutDay_userId_date_idx; Type: INDEX; Schema: public; Owner: gym
--

CREATE INDEX "WorkoutDay_userId_date_idx" ON public."WorkoutDay" USING btree ("userId", date);


--
-- Name: Exercise trg_set_updated_exercise; Type: TRIGGER; Schema: public; Owner: gym
--

CREATE TRIGGER trg_set_updated_exercise BEFORE UPDATE ON public."Exercise" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: Set trg_set_updated_set; Type: TRIGGER; Schema: public; Owner: gym
--

CREATE TRIGGER trg_set_updated_set BEFORE UPDATE ON public."Set" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: WorkoutDay trg_set_updated_workoutday; Type: TRIGGER; Schema: public; Owner: gym
--

CREATE TRIGGER trg_set_updated_workoutday BEFORE UPDATE ON public."WorkoutDay" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: Exercise Exercise_workoutDayId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gym
--

ALTER TABLE ONLY public."Exercise"
    ADD CONSTRAINT "Exercise_workoutDayId_fkey" FOREIGN KEY ("workoutDayId") REFERENCES public."WorkoutDay"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Set Set_exerciseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gym
--

ALTER TABLE ONLY public."Set"
    ADD CONSTRAINT "Set_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES public."Exercise"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WorkoutDay WorkoutDay_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gym
--

ALTER TABLE ONLY public."WorkoutDay"
    ADD CONSTRAINT "WorkoutDay_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

