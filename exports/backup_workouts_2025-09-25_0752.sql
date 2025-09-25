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
cmy0tfvce4ff4m35cji1fm9i	cm55j5xlr4c4erqmic7djuii	1	Μηχάνημα Έξω Μηριαίων (Abductor)	\N	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cmwkgcnslj2rai28b25vaz6u	cm55j5xlr4c4erqmic7djuii	2	Μηχάνημα Έσω Μηριαίων (Adductor)	\N	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cmlohyahu73xpgj2sb8x0q5i	cm55j5xlr4c4erqmic7djuii	3	Μηχάνημα Εκτάσεις Τετρακεφάλων (Leg Extension)	\N	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cm7g11iqd4gi2akx1bmnroi2	cm55j5xlr4c4erqmic7djuii	4	Μηχάνημα Κάμψεις Ποδιών (Leg Curl)	\N	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cmfkfuwgocm1ohhdam8g1ou5	cm55j5xlr4c4erqmic7djuii	5	Μηχάνημα Κοιλιακών (Ab Crunch)	\N	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cm6zu14yrfp3grx63p4l0vl6	cmvalmscsdson0a6gv47kuhl	1	Μηχάνημα Πιέσεων Ποδιών (Leg Press)	\N	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cmsy9mdc9n0duyyhfykmjcea	cmvalmscsdson0a6gv47kuhl	2	Καθίσματα με Μπάρα (Barbell Squat)	\N	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cmulkyl6cxin70x6s9yq9krm	cmvalmscsdson0a6gv47kuhl	3	Προβολές με Αλτήρες (Dumbbell Lunges)	\N	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cmuk25d74lj711tgfte8o4uc	cmvalmscsdson0a6gv47kuhl	4	Μηχάνημα Εκτάσεων Τετρακεφάλων (Leg Extension)	\N	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cm2tugarvd443l3cizw0rrhp	cmvalmscsdson0a6gv47kuhl	5	Μηχάνημα Κάμψεων Οπισθίων Μηριαίων (Leg Curl)	\N	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cmbgadjwfznuvjizw9ijpli5	cmkmyqrm2kpeiceu5o6lkty5	1	Μηχάνημα Έλξεων (Lat Pulldown)	\N	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cm6377q87rdu9vec9p4jkheh	cmkmyqrm2kpeiceu5o6lkty5	2	Μηχάνημα Κωπηλατικής (Low Row) με V-Bar	\N	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cmdefk3z7roo8eoqdgh3u5cs	cmkmyqrm2kpeiceu5o6lkty5	3	Κωπηλατική με Μπάρα (Barbell Row)	\N	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cmyj73dirpdjkt5eo0a0tjzj	cmkmyqrm2kpeiceu5o6lkty5	4	Κάμψεις Δικεφάλων με Στραβομπάρα (EZ Bar Curl)	\N	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cm2v1to5k8gx1gmn3r8gf6q1	cmkmyqrm2kpeiceu5o6lkty5	5	Κοιλιακοί (Abs)	\N	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
\.


--
-- Data for Name: Set; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Set" (id, "exerciseId", "order", kg, reps, notes, "deletedAt", "createdAt", "updatedAt") FROM stdin;
cm0cjaxit0g7ez0qd3cr39z6	cmy0tfvce4ff4m35cji1fm9i	1	36	12	\N	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cmbsnkhus59qqoh7128hsvck	cmy0tfvce4ff4m35cji1fm9i	2	43	12	\N	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cm5lpa3vux6ymqdng7x35zn7	cmy0tfvce4ff4m35cji1fm9i	3	50	12	\N	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cmh4v8968h0o58vuk0jqz2jj	cmy0tfvce4ff4m35cji1fm9i	4	50	12	\N	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cmiwtb0m5hm04i6jhw15c8mz	cmwkgcnslj2rai28b25vaz6u	1	36	12	\N	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cm253c6irvcz0d4p5q1q8akl	cmwkgcnslj2rai28b25vaz6u	2	43	8	Δυσκολεύτηκα	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cmakode6obimeuegyur0sz0i	cmwkgcnslj2rai28b25vaz6u	3	43	6	Ρίχνω κιλά	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cmxnahby9nec5rbrslc14slj	cm6zu14yrfp3grx63p4l0vl6	1	100	15	Ζέσταμα	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cmxeka8zuv6e9cj9mojozrwi	cm6zu14yrfp3grx63p4l0vl6	2	140	12	Καλή ένταση	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cmobevn6f0qeipdbt0vfhmaq	cm6zu14yrfp3grx63p4l0vl6	3	180	10	Δύσκολο σετ, κοντά σε αποτυχία	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cmhnhdefcqwhc3fr717od2gr	cmsy9mdc9n0duyyhfykmjcea	1	60	12	Εύκολο ξεκίνημα	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cm63vttchu3db53xu5tjmc7h	cmsy9mdc9n0duyyhfykmjcea	2	80	10	Καλή τεχνική	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cm1r5gy2me01iyjl4re45vu5	cmsy9mdc9n0duyyhfykmjcea	3	100	8	Αποτυχία στο τέλος	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cmtqir34injn6h9qzluui9ls	cmulkyl6cxin70x6s9yq9krm	1	20	\N	Σταθερά βήματα (επαναλήψεις: 12 (κάθε πόδι))	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cmb4s5mbfgm5ckv35y8al84c	cmulkyl6cxin70x6s9yq9krm	2	24	\N	Καλή δυσκολία (επαναλήψεις: 10 (κάθε πόδι))	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cm0veglgh0ao7y0uk8dd4jrf	cmulkyl6cxin70x6s9yq9krm	3	26	\N	Αποτυχία στο τελευταίο (επαναλήψεις: 8 (κάθε πόδι))	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cmuber2uj9ogisr82o9q8194	cmuk25d74lj711tgfte8o4uc	1	40	15	Εύκολο	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cmanb329u8vuzdmcbzhn5guk	cmuk25d74lj711tgfte8o4uc	2	50	12	Καλή πίεση	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cm89gp6pg0hgmrzdixc9kh9v	cmuk25d74lj711tgfte8o4uc	3	60	10	Αποτυχία	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cm1wqt7a6vlewxil68zge7io	cm2tugarvd443l3cizw0rrhp	1	30	15	Ζέσταμα	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cm8pynkeifg06yfoajp4wo19	cm2tugarvd443l3cizw0rrhp	2	40	12	Καλή ένταση	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cmsu88zy895rp8bhtprthh7g	cm2tugarvd443l3cizw0rrhp	3	50	8	Δύσκολο, κοντά σε αποτυχία	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cml1fjlqiije1ksvrck8alzx	cmbgadjwfznuvjizw9ijpli5	1	39	12	\N	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cmpm7fnh1vryv4njdfjuelwt	cmbgadjwfznuvjizw9ijpli5	2	45	12	Με δυσκολία	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cmaninth9eljea4mmdxqh2xc	cmbgadjwfznuvjizw9ijpli5	3	52	10	Αποτυχία	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cm5bojbnbamkzvs510cd64yl	cmbgadjwfznuvjizw9ijpli5	4	59	9	Αποτυχία	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cmkxgeu8c3zn0wejug71sx6a	cm6377q87rdu9vec9p4jkheh	1	52	12	\N	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cmeezika4nwa9ii7vdy7tdri	cm6377q87rdu9vec9p4jkheh	2	59	12	\N	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cmidzvf1afeimtdtablrapmj	cm6377q87rdu9vec9p4jkheh	3	66	12	Αποτυχία	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cmc4m9iifztmihfpkyl9p66e	cm6377q87rdu9vec9p4jkheh	4	66	12	Αποτυχία	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cmanei89spbnvi2mddtvenn7	cmdefk3z7roo8eoqdgh3u5cs	1	20	12	\N	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cmuipdz7hca8si0jy58la7tm	cmdefk3z7roo8eoqdgh3u5cs	2	30	10	Με δυσκολία	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cm96cwjjbq5h97491xc7qw2c	cmdefk3z7roo8eoqdgh3u5cs	3	30	10	Αποτυχία	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cm9lkq46mo6b55t0tzsgurpl	cmdefk3z7roo8eoqdgh3u5cs	4	30	10	Αποτυχία	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cmn42ikx2ndf50bnl0jzoocg	cmyj73dirpdjkt5eo0a0tjzj	1	20	12	Εύκολο	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cm895xof2yhmmrufte64au4r	cmyj73dirpdjkt5eo0a0tjzj	2	20	12	Εύκολο	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cmb10qi7gdy1q78kxdsi52mh	cmyj73dirpdjkt5eo0a0tjzj	3	20	12	Εύκολο	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cm1nfczgwjacrcvod6bg1ddp	cmyj73dirpdjkt5eo0a0tjzj	4	20	12	Εύκολο	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cmtvffvr1xfajj5rjsuog8e2	cmyj73dirpdjkt5eo0a0tjzj	5	20	12	Εύκολο	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cmyt7yn3250b65b013ocqyax	cm2v1to5k8gx1gmn3r8gf6q1	1	\N	20	(Σωματικό βάρος)	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cmezjnl7w9usnsuk5lk6d1qq	cm2v1to5k8gx1gmn3r8gf6q1	2	\N	20	(Σωματικό βάρος)	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cmfdgum5sa48f43lei9vj9ay	cm2v1to5k8gx1gmn3r8gf6q1	3	\N	20	(Σωματικό βάρος)	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
\.


--
-- Data for Name: WorkoutDay; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."WorkoutDay" (id, "userId", date, program, notes, "deletedAt", "createdAt", "updatedAt") FROM stdin;
cm55j5xlr4c4erqmic7djuii	\N	2025-09-19 00:00:00	Πόδια	\N	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cmvalmscsdson0a6gv47kuhl	\N	2025-09-22 00:00:00	Πόδια	\N	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
cmkmyqrm2kpeiceu5o6lkty5	\N	2025-09-23 00:00:00	Πλάτη & Δικέφαλοι	\N	\N	2025-09-24 23:37:00.652	2025-09-24 23:37:00.652
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

