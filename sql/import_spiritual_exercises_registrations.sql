-- Import spiritual exercises registrations from old form
-- Date: 2025-11-30

INSERT INTO spiritual_exercises_registrations (
  id, exercise_id, email, first_name, last_name, phone, birth_date, id_card_number,
  city, street, postal_code, parish, diocese, room_type, dietary_restrictions,
  notes, referral_source, gdpr_consent, responsibility_consent, newsletter_consent,
  payment_status, payment_amount, payment_notes, registration_date, updated_at,
  registered_by, user_id
) VALUES
(9, 2, 'ingridkauhrinova@gmail.com', 'Ingrid', 'Uhrinova', '+421944003836', '1979-01-27', 'MG192437', 'Nové Zámky', 'Andovská 74', '940 02', 'Nové Zámky', 'Biskupstvo Žilina', 'Jednolôžková izba', '', 'Ingrid Uhrinová Lectio divina', 'Z aplikácie Lectio divina', TRUE, TRUE, TRUE, 'pending', 150.00, '', NOW(), NOW(), NULL, NULL),
(10, 2, 'dasenkadt@gmail.com', 'Dáša', 'Bodoríková', '+421903623755', '1984-02-02', 'MF978854', 'Vyšný Kubín', 'Vyšnokubínska 325', '02601', 'Dolný Kubín', 'Biskupstvo Spiš', '3-lôžkovej izbe', '', 'Ubytovanie na izbe s Katarínou a Alenkou Horváthovou z Ružomberka, súhlasia.', 'Od známych', TRUE, TRUE, TRUE, 'pending', 150.01, '', NOW(), NOW(), NULL, NULL),
(11, 2, 'martinlazik@gmail.com', 'Martin', 'Lazík', '+421911504449', '1975-07-23', 'MG015895', 'Liptovské Revúce', 'Nižná Revúca 97', '034 74', 'Liptovské Revúce', 'Biskupstvo Spiš', '4-lôžkovej izbe', '', '', 'Z aplikácie Lectio divina', TRUE, TRUE, TRUE, 'pending', 150.02, '', NOW(), NOW(), NULL, NULL),
(12, 2, 'hrckova8@gmail.com', 'Alena', 'Horváthová', '+421908211785', '1971-06-21', 'MH565021', 'Ružomberok', 'Štiavnická 1825/6', '03401', 'Ružomberok', 'Biskupstvo Žilina', 'Dvojlôžková izba', '', 'Ubytovanie s Katarína Škultétyová', 'Z aplikácie Lectio divina', TRUE, TRUE, TRUE, 'pending', 150.03, '', NOW(), NOW(), NULL, NULL),
(13, 2, 'ludka254@atlas.sk', 'Ľudmila', 'Žilincová', '+421903027051', '1978-10-22', '', 'N', 'Pod Uhliskom 254/21', '11111', 'N', 'Biskupstvo Spiš', 'Jednolôžková izba', '', '', 'Z internetu', TRUE, TRUE, TRUE, 'pending', 150.04, '', NOW(), NOW(), NULL, NULL),
(14, 2, 'hrckova8@gmail.com', 'Škultétyová', 'Katarína', '+421908658425', '1982-11-15', 'NP877345', 'Ružomberok', 'Vyšné Matejkovo 7854', '03403', 'Ružomberok, Biely Potok', 'Biskupstvo Žilina', 'Dvojlôžková izba', 'Nie', 'Ubytovanie s Alenou Horváthovou', 'Od známych', TRUE, TRUE, TRUE, 'pending', 150.05, '', NOW(), NOW(), NULL, NULL),
(15, 2, 'pavol.nemcek@gmail.com', 'Pavol', 'Nemček', '+421918999456', '1980-04-04', 'ML932515', 'Cabaj-Čápor', 'Podhájska ulica 729/46', '95117', 'Cabaj-Čápor', 'Biskupstvo Nitra', 'Dvojlôžková izba', '', 'ubytovanie s manželkou Janou Nemčekovou', 'Od známych', TRUE, TRUE, TRUE, 'pending', 150.06, '', NOW(), NOW(), NULL, NULL),
(16, 2, 'tilia.tilia2310@gmail.com', 'Jana', 'Nemčeková', '+421918999456', '1981-01-30', 'ML967706', 'Cabaj-Čápor', 'Podhájska ulica 729/46', '95117', 'Cabaj-Čápor', 'Biskupstvo Nitra', 'Dvojlôžková izba', '', 'ubytovanie s manželom Pavlom Nemčekom', 'Z aplikácie Lectio divina', TRUE, TRUE, TRUE, 'pending', 150.07, '', NOW(), NOW(), NULL, NULL),
(17, 2, 'katarina.faturikova@gmail.com', 'Katarína', 'Faturíková', '+421905291960', '1980-05-25', 'MG077228', 'Ladce', 'Ul. Janka Krala 498/32', '01863', 'Ladce', 'Biskupstvo Žilina', '4-lôžkovej izbe', '', '', 'Z aplikácie Lectio divina', TRUE, TRUE, TRUE, 'pending', 150.08, '', NOW(), NOW(), NULL, NULL),
(18, 2, 'asmieskova@gmail.com', 'Anna', 'Smiešková', '+421911657718', '1961-03-03', 'HR190035', 'Trnava', 'Školská 2', '91701', 'Trnava', 'Arcibiskupstvo Trnava', 'Dvojlôžková izba', '', 'Ivan Smieško manžel', 'Z aplikácie Lectio divina', TRUE, TRUE, TRUE, 'pending', 150.09, '', NOW(), NOW(), NULL, NULL),
(19, 2, 'ajsmajl@gmail.com', 'Ivan', 'Smieško', '+421910673073', '1957-08-01', 'HR190042', 'Trnava', 'Školská 2', '91701', 'Trnava', 'Arcibiskupstvo Trnava', 'Dvojlôžková izba', 'Bezlaktozove, diabetes', 'Anna Smiešková manzelka', 'Z aplikácie Lectio divina', TRUE, TRUE, TRUE, 'pending', 150.10, '', NOW(), NOW(), NULL, NULL),
(20, 2, 'gallovagabriela.gg@gmail.com', 'Gabriela', 'Gallová', '+421904671749', '1986-11-02', 'JD640176', 'Žilina', 'Strieborná 1218/16', '01003', 'Zilina', 'Biskupstvo Žilina', '4-lôžkovej izbe', '', 'Ak môžem byt prosím na izbe s Andrejkou Jakubov a Soničkou', 'Od známych', TRUE, TRUE, TRUE, 'pending', 150.11, '', NOW(), NOW(), NULL, NULL),
(21, 2, 'lucinka1961@gmail.com', 'Lotta', 'Mižiková', '+421918722009', '1961-08-19', 'MK821915', 'Ružomberok', 'Klačno 21', 'Ružomberok - 034 01', 'Ružomberok', 'Biskupstvo Spiš', 'Jednolôžková izba', '', 'Môj dátum narodenia je - 19.08.1961', 'Z aplikácie Lectio divina', TRUE, TRUE, TRUE, 'pending', 150.12, '', NOW(), NOW(), NULL, NULL),
(22, 2, 'k.machynova@gmail.com', 'Katarína', 'Machynová', '+421903013950', '1979-12-29', 'MK433356', 'Rosina', 'Do poľa 1144', '013 22', 'Rosina', 'Biskupstvo Žilina', 'Jednolôžková izba', '', '', 'Od známych', TRUE, TRUE, TRUE, 'pending', 150.13, '', NOW(), NOW(), NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  phone = EXCLUDED.phone,
  room_type = EXCLUDED.room_type,
  payment_amount = EXCLUDED.payment_amount;

-- Update sequence to continue from highest ID
SELECT setval('spiritual_exercises_registrations_id_seq', (SELECT MAX(id) FROM spiritual_exercises_registrations));
