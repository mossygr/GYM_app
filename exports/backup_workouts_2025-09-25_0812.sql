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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Exercise; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: Set; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: WorkoutDay; Type: TABLE; Schema: public; Owner: -
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


--
-- Data for Name: Exercise; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Exercise" (id, "workoutDayId", "order", "nameGr", "nameEn", "deletedAt", "createdAt", "updatedAt") FROM stdin;
58790612d9ba00f1dea4e6fa9c8aae02	a2ade43beba7e7546161277ff2848495	5	Μηχάνημα Κοιλιακών (Ab Crunch)	\N	\N	2025-09-25 08:07:47.363	2025-09-25 08:07:47.363
ed6d3f90f3c0b81f26bd03318d14e11b	a2ade43beba7e7546161277ff2848495	4	Μηχάνημα Κάμψεις Ποδιών (Leg Curl)	\N	\N	2025-09-25 08:07:47.363	2025-09-25 08:07:47.363
e88f229dc9465a68b33fab7e6d4890ec	a2ade43beba7e7546161277ff2848495	3	Μηχάνημα Εκτάσεις Τετρακεφάλων (Leg Extension)	\N	\N	2025-09-25 08:07:47.363	2025-09-25 08:07:47.363
f02c6b4624db090a400b9119486b6e4b	a2ade43beba7e7546161277ff2848495	2	Μηχάνημα Έσω Μηριαίων (Adductor)	\N	\N	2025-09-25 08:07:47.363	2025-09-25 08:07:47.363
599150725d1af3eb4bafe5410b7bd2d2	a2ade43beba7e7546161277ff2848495	1	Μηχάνημα Έξω Μηριαίων (Abductor)	\N	\N	2025-09-25 08:07:47.363	2025-09-25 08:07:47.363
\.


--
-- Data for Name: Set; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Set" (id, "exerciseId", "order", kg, reps, notes, "deletedAt", "createdAt", "updatedAt") FROM stdin;
111f7b5d78cf6790f0ddc860e5b3d3fe	f02c6b4624db090a400b9119486b6e4b	1	36	12	\N	\N	2025-09-25 08:07:47.363	2025-09-25 08:07:47.363
1681185bec2aa95a05c00cf3a17ccedb	f02c6b4624db090a400b9119486b6e4b	2	43	8	Δυσκολεύτηκα	\N	2025-09-25 08:07:47.363	2025-09-25 08:07:47.363
6408dc4f7efddef2377f555cdc8c227e	f02c6b4624db090a400b9119486b6e4b	3	43	6	Ρίχνω κιλά	\N	2025-09-25 08:07:47.363	2025-09-25 08:07:47.363
fdffdc7f3fbfec3c43ad4fe18e4671ab	599150725d1af3eb4bafe5410b7bd2d2	1	36	12	\N	\N	2025-09-25 08:07:47.363	2025-09-25 08:07:47.363
2c263e8ccb443ee6f6fe03c47f1374c3	599150725d1af3eb4bafe5410b7bd2d2	2	43	12	\N	\N	2025-09-25 08:07:47.363	2025-09-25 08:07:47.363
94ad4096e1882418a23818d847b5c2bf	599150725d1af3eb4bafe5410b7bd2d2	3	50	12	\N	\N	2025-09-25 08:07:47.363	2025-09-25 08:07:47.363
9f771118c22a84058fc8dc11c982f35d	599150725d1af3eb4bafe5410b7bd2d2	4	50	12	\N	\N	2025-09-25 08:07:47.363	2025-09-25 08:07:47.363
\.


--
-- Data for Name: WorkoutDay; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."WorkoutDay" (id, "userId", date, program, notes, "deletedAt", "createdAt", "updatedAt") FROM stdin;
a2ade43beba7e7546161277ff2848495	\N	2025-09-19 00:00:00	Πόδια	\N	\N	2025-09-25 08:07:47.363	2025-09-25 08:07:47.363
\.


--
-- Name: Exercise Exercise_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Exercise"
    ADD CONSTRAINT "Exercise_pkey" PRIMARY KEY (id);


--
-- Name: Set Set_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Set"
    ADD CONSTRAINT "Set_pkey" PRIMARY KEY (id);


--
-- Name: WorkoutDay WorkoutDay_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WorkoutDay"
    ADD CONSTRAINT "WorkoutDay_pkey" PRIMARY KEY (id);


--
-- Name: Exercise_workoutDayId_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Exercise_workoutDayId_order_idx" ON public."Exercise" USING btree ("workoutDayId", "order");


--
-- Name: Set_exerciseId_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Set_exerciseId_order_idx" ON public."Set" USING btree ("exerciseId", "order");


--
-- Name: WorkoutDay_userId_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "WorkoutDay_userId_date_idx" ON public."WorkoutDay" USING btree ("userId", date);


--
-- Name: Exercise trg_set_updated_exercise; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_updated_exercise BEFORE UPDATE ON public."Exercise" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: Set trg_set_updated_set; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_updated_set BEFORE UPDATE ON public."Set" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: WorkoutDay trg_set_updated_workoutday; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_updated_workoutday BEFORE UPDATE ON public."WorkoutDay" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: Exercise Exercise_workoutDayId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Exercise"
    ADD CONSTRAINT "Exercise_workoutDayId_fkey" FOREIGN KEY ("workoutDayId") REFERENCES public."WorkoutDay"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Set Set_exerciseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Set"
    ADD CONSTRAINT "Set_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES public."Exercise"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WorkoutDay WorkoutDay_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WorkoutDay"
    ADD CONSTRAINT "WorkoutDay_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

