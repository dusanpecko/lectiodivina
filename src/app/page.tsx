"use client";
import { useLanguage } from "./components/LanguageProvider";
import { translations } from "./i18n";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { Language } from "./components/LanguageProvider";
import { motion } from "framer-motion";
import DailyQuote from "./components/DailyQuote";
import Logo from "./components/Logo";
import { HomeNewsSection } from "@/app/components/HomeNewsSection";
import CommunitySection from "./components/CommunitySection";

type LectioStep = {
  title: string;
  desc: string;
};

const lectioIcons = [
    // LECTIO
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-14 h-14 text-indigo-400 mb-2"
    viewBox="0 0 512 512"
    fill="#4a5085"
  >
    <path d="M291.057,242.811c1.51,2.953,4.514,4.659,7.62,4.659c1.297,0,2.628-0.299,3.866-0.93
      c0.503-0.256,50.731-25.771,75.503-33.596c4.489-1.425,6.98-6.221,5.555-10.709c-1.417-4.489-6.178-6.989-10.709-5.572
      c-26.095,8.252-75.981,33.596-78.097,34.671C290.596,233.467,288.924,238.605,291.057,242.811z"/>
    <path d="M298.677,145.071c1.297,0,2.628-0.299,3.866-0.93c0.503-0.256,50.731-25.771,75.503-33.596
      c4.489-1.425,6.98-6.221,5.555-10.709c-1.417-4.489-6.178-6.989-10.709-5.572c-26.095,8.252-75.981,33.596-78.097,34.671
      c-4.198,2.133-5.871,7.27-3.738,11.477C292.567,143.364,295.571,145.071,298.677,145.071z"/>
    <path d="M503.469,128.004c-4.719,0-8.533,3.823-8.533,8.533v332.8c0,14.114-11.486,25.6-25.6,25.6h-204.8v-19.635
      c12.442-4.352,44.851-14.498,76.8-14.498c74.334,0,124.809,16.461,125.312,16.631c2.568,0.853,5.436,0.427,7.68-1.178
      c2.227-1.604,3.541-4.181,3.541-6.921V93.871c0-4.002-2.773-7.467-6.682-8.329c0,0-6.69-1.493-18.125-3.593
      c-4.617-0.853-9.079,2.219-9.933,6.844c-0.853,4.642,2.21,9.088,6.844,9.941c4.361,0.802,8.013,1.51,10.829,2.074v357.188
      c-19.337-5.069-62.276-14.259-119.467-14.259c-37.18,0-73.702,12.211-85.001,16.35c-10.044-4.437-40.405-16.35-77.133-16.35
      c-58.778,0-107.196,9.694-128,14.618V100.475c17.041-4.19,67.371-15.138,128-15.138c31.113,0,57.796,9.685,68.267,14.063v335.804
      c0,3.072,1.655,5.914,4.326,7.424c2.671,1.519,5.965,1.476,8.602-0.111c0.845-0.503,85.393-51.004,160.435-76.015
      c3.49-1.169,5.837-4.42,5.837-8.098V8.537c0-2.799-1.374-5.419-3.678-7.014c-2.287-1.596-5.222-1.963-7.859-0.981
      C346.856,26.15,277.771,69.141,277.079,69.568c-3.994,2.5-5.214,7.765-2.714,11.759c2.492,3.994,7.757,5.214,11.759,2.714
      c0.631-0.401,60.732-37.794,123.477-63.027v331.281c-58.249,20.241-119.066,53.291-145.067,68.087V93.871
      c0-3.234-1.826-6.187-4.719-7.637c-1.468-0.725-36.437-17.963-80.614-17.963c-77.107,0-136.388,16.683-138.88,17.399
      c-3.661,1.041-6.187,4.395-6.187,8.201v375.467c0,2.671,1.263,5.197,3.388,6.81c1.502,1.135,3.311,1.724,5.146,1.724
      c0.785,0,1.57-0.111,2.338-0.333c0.589-0.162,59.597-16.734,134.195-16.734c31.198,0,57.856,9.711,68.267,14.071v20.062h-204.8
      c-14.114,0-25.6-11.486-25.6-25.6v-332.8c0-4.71-3.823-8.533-8.533-8.533s-8.533,3.823-8.533,8.533v332.8
      c0,23.526,19.14,42.667,42.667,42.667h426.667c23.526,0,42.667-19.14,42.667-42.667v-332.8
      C512.002,131.827,508.188,128.004,503.469,128.004z"/>
    <path d="M291.057,191.611c1.51,2.953,4.514,4.659,7.62,4.659c1.297,0,2.628-0.299,3.866-0.93
      c0.503-0.256,50.731-25.771,75.503-33.596c4.489-1.425,6.98-6.221,5.555-10.709c-1.417-4.489-6.178-6.989-10.709-5.572
      c-26.095,8.252-75.981,33.596-78.097,34.671C290.596,182.267,288.924,187.405,291.057,191.611z"/>
    <path d="M291.057,294.011c1.51,2.953,4.514,4.659,7.62,4.659c1.297,0,2.628-0.299,3.866-0.93
      c0.503-0.256,50.731-25.771,75.503-33.596c4.489-1.425,6.98-6.221,5.555-10.709c-1.417-4.489-6.178-6.989-10.709-5.572
      c-26.095,8.252-75.981,33.596-78.097,34.671C290.596,284.667,288.924,289.805,291.057,294.011z"/>
    <path d="M206.748,158.366c-52.693-12.365-112.572,3.388-115.089,4.062c-4.548,1.22-7.253,5.896-6.033,10.453
      c1.024,3.814,4.471,6.323,8.235,6.323c0.734,0,1.476-0.094,2.219-0.29c0.572-0.162,58.223-15.326,106.778-3.934
      c4.565,1.067,9.182-1.775,10.257-6.366C214.189,164.032,211.339,159.441,206.748,158.366z"/>
    <path d="M206.748,209.566c-52.693-12.356-112.572,3.388-115.089,4.062c-4.548,1.22-7.253,5.897-6.033,10.453
      c1.024,3.814,4.471,6.323,8.235,6.323c0.734,0,1.476-0.094,2.219-0.29c0.572-0.162,58.223-15.326,106.778-3.934
      c4.565,1.067,9.182-1.775,10.257-6.366C214.189,215.232,211.339,210.641,206.748,209.566z"/>
    <path d="M291.057,345.211c1.51,2.953,4.514,4.659,7.62,4.659c1.297,0,2.628-0.299,3.866-0.93
      c0.503-0.256,50.731-25.771,75.503-33.596c4.489-1.425,6.98-6.221,5.555-10.709c-1.417-4.488-6.178-6.989-10.709-5.572
      c-26.095,8.252-75.981,33.596-78.097,34.671C290.596,335.867,288.924,341.005,291.057,345.211z"/>
    <path d="M206.748,260.766c-52.693-12.356-112.572,3.379-115.089,4.062c-4.548,1.22-7.253,5.897-6.033,10.453
      c1.024,3.814,4.471,6.332,8.235,6.332c0.734,0,1.476-0.102,2.219-0.299c0.572-0.162,58.223-15.326,106.778-3.934
      c4.565,1.067,9.182-1.775,10.257-6.366C214.189,266.432,211.339,261.841,206.748,260.766z"/>
    <path d="M206.748,363.166c-52.693-12.365-112.572,3.388-115.089,4.062c-4.548,1.22-7.253,5.897-6.033,10.453
      c1.024,3.814,4.471,6.332,8.235,6.332c0.734,0,1.476-0.102,2.219-0.299c0.572-0.162,58.223-15.326,106.778-3.934
      c4.565,1.058,9.182-1.775,10.257-6.366C214.189,368.832,211.339,364.241,206.748,363.166z"/>
    <path d="M206.748,311.966c-52.693-12.365-112.572,3.379-115.089,4.062c-4.548,1.22-7.253,5.897-6.033,10.453
      c1.024,3.814,4.471,6.332,8.235,6.332c0.734,0,1.476-0.102,2.219-0.299c0.572-0.162,58.223-15.326,106.778-3.934
      c4.565,1.067,9.182-1.775,10.257-6.366C214.189,317.632,211.339,313.041,206.748,311.966z"/>
  </svg>,
   // MEDITATIO
  <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 516.657 516.657"
        className="w-14 h-14 text-indigo-400 mb-2"
        fill="#4a5085"
      >
        <path d="M487.404 134.943c-15.433-17.093-35.591-28.433-57.82-32.747-1.316-18.283-8.667-35.487-21.202-49.247-14.773-16.219-34.978-25.713-56.893-26.734-12.913-.609-25.528 1.78-37.119 6.945-18.304-19.896-43.535-31.77-70.994-33.05-23.558-1.094-46.984 5.988-65.946 19.955-14.661 10.8-26.212 25.345-33.44 41.872-5.676-1.104-11.439-1.797-17.244-2.067-65.413-3.073-121.055 47.663-124.102 113.045-2.195 47.086 23.782 90.834 65.415 111.684 3.283 21.936 16.314 40.779 34.581 51.921-6.026 10.335-9.496 22.335-9.496 35.137 0 38.599 31.402 70 70 70 34.515 0 63.256-25.116 68.955-58.028.484.008.969.034 1.453.034 26.318-.002 51.089-11.993 67.49-32.025 12.71 8.537 27.546 13.48 43.141 14.207 20.277.945 40.235-5.432 56.186-17.958 12.872-10.109 22.491-23.686 27.768-38.969 47.64-8.597 83.961-49.271 86.262-98.604 1.298-27.885-8.288-54.652-26.995-75.371zm-324.261 276.714c-22.056 0-40-17.944-40-40s17.944-40 40-40 40 17.944 40 40-17.944 40-40 40zm321.286-202.739c-1.764 37.846-31.531 68.563-69.239 71.452-6.679.512-12.21 5.39-13.551 11.953-2.577 12.611-9.609 23.965-19.802 31.97-10.291 8.081-23.174 12.177-36.26 11.585-14.075-.656-27.196-6.64-36.946-16.85-3.354-3.512-8.201-5.18-13.006-4.484-4.806.698-8.976 3.68-11.191 8.002-10.204 19.906-31.213 32.08-53.528 31.056-.047-.002-.093-.007-.139-.009-7.987-29.869-35.272-51.936-67.624-51.936-14.568 0-28.108 4.478-39.324 12.123-15.443-6.575-26.302-21.777-26.565-39.435-.09-6.026-3.778-11.414-9.364-13.678-34.814-14.11-57.028-48.814-55.278-86.356 2.278-48.856 43.897-86.743 92.735-84.475 8.021.375 15.931 1.821 23.509 4.299 3.904 1.276 8.161.896 11.777-1.052s6.275-5.294 7.356-9.257c4.304-15.775 13.976-29.841 27.234-39.607 13.634-10.041 29.794-14.917 46.756-14.143 22.685 1.059 43.229 12.316 56.365 30.887 4.684 6.624 13.786 8.322 20.542 3.835 9.275-6.156 20.073-9.119 31.207-8.617 13.91.648 26.734 6.675 36.111 16.97 9.377 10.294 14.184 23.623 13.535 37.531-.043.925-.125 1.947-.25 3.125-.433 4.085.827 8.168 3.487 11.298s6.487 5.031 10.588 5.262c40.987 2.301 72.777 37.539 70.865 78.551z"/>
        <path d="M52.143 416.657c-27.57 0-50 22.43-50 50s22.43 50 50 50 50-22.43 50-50-22.43-50-50-50zm0 70c-11.028 0-20-8.972-20-20s8.972-20 20-20 20 8.972 20 20-8.972 20-20 20z"/>
      </svg>,
  // ORATIO
  <svg
    key="oratio"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    className="w-14 h-14 text-indigo-400 mb-2"
    fill="#4a5085"
  >
    <path d="m56.95117 43.9209-3.92041-3.9209a3.105 3.105 0 0 0 -4.5117.26908l-2.51271-1.48685a3.0539 3.0539 0 0 1 -1.49854-2.84571l.44483-6.60839a11.06321 11.06321 0 0 0 -.72071-4.71778l-7.21582-18.5791a3.04842 3.04842 0 0 0 -4.98089-1.10089 3.03879 3.03879 0 0 0 -1.317-.80438 3.09259 3.09259 0 0 0 -3.73437 1.83593l-7.21578 18.58009c-1.3494 2.83758-.3692 8.29357-.27589 11.3262a3.0544 3.0544 0 0 1 -1.49853 2.84665l-2.512 1.48651a3.04917 3.04917 0 0 0 -4.51191-.26967l-3.92091 3.92085a.99962.99962 0 0 0 0 1.41406l14.37207 14.37207a.99962.99962 0 0 0 1.41406 0l3.9209-3.9209a3.0142 3.0142 0 0 0 0-4.24218l-.39884-.39887c.958-.75763 4.68556-3.45176 5.62634-5.70468.91964 2.28558 4.682 4.99657 5.65961 5.77312a3.29964 3.29964 0 0 0 -1.27718 2.5199 2.98081 2.98081 0 0 0 .87838 2.12107l3.92083 3.92087a.99962.99962 0 0 0 1.41406 0l14.37211-14.372a.99962.99962 0 0 0 0-1.4141zm-25.0083-11.98633a8.75247 8.75247 0 0 1 .05181-3.91083 8.92494 8.92494 0 0 1 .0624 3.97821c-.05454.30017-.0635.13162-.11421-.06738zm.08942-12.86157a3.38643 3.38643 0 0 0 -1.58081-.92957l1.54046-6.67627 1.55646 6.74445a3.38377 3.38377 0 0 0 -1.51611.86139zm-6.69049 35.23071-3.21387 3.21387-12.958-12.958 3.21387-3.21387a1.00319 1.00319 0 0 1 1.41406 0l11.54346 11.544a1.0049 1.0049 0 0 1 .00048 1.414zm3.77246-8.23633a31.369 31.369 0 0 1 -4.20111 3.56549l-7.97187-7.97187 2.07093-1.22546a5.044 5.044 0 0 0 2.47509-4.70214l-.44482-6.6074a9.05609 9.05609 0 0 1 .58984-3.85938l7.21582-18.5801a1.07637 1.07637 0 0 1 2.04978.627l-2.52092 10.9236a3.38959 3.38959 0 0 0 -2.0484 2.15546l-2.59472 8.13086a.99988.99988 0 1 0 1.90527.60742l2.59474-8.13086a1.41255 1.41255 0 0 1 2.73679.64754l-1.13084 7.20793c-.4436 3.80718 1.192 5.81579 1.15166 10.70369.04495 2.39772-.3733 5.11718-1.87724 6.50822zm5.77148.06836c-1.51756-1.4047-1.93317-4.161-1.87613-6.583-.02465-4.85791 1.59381-6.83817 1.15075-10.62889l-1.13106-7.208a1.4125 1.4125 0 0 1 2.73683-.64738l2.59471 8.1298a.99988.99988 0 1 0 1.90527-.60742l-2.59472-8.12988a3.38689 3.38689 0 0 0 -2.04816-2.15424l-2.52118-10.92294a1.07651 1.07651 0 0 1 2.04982-.62879l7.21581 18.58a9.054 9.054 0 0 1 .58984 3.8584l-.44482 6.6084a5.04248 5.04248 0 0 0 2.47509 4.70117l2.07154 1.22583-7.97248 7.97247a31.369 31.369 0 0 1 -4.20111-3.56553zm6.98633 11.4502-3.21338-3.21387a.99319.99319 0 0 1 -.293-.707c0-.26758 11.83692-12.251 11.83692-12.251a1.00343 1.00343 0 0 1 1.41357 0l3.21387 3.21386z"/>
  </svg>,
  // CONTEMPLATIO
  <svg
    key="contemplatio"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    className="w-14 h-14 text-indigo-400 mb-2"
    fill="#4a5085"
  >
    <path d="M40,16.025V11a7.008,7.008,0,0,0-7-7H15a7.008,7.008,0,0,0-7,7v5.025a5.5,5.5,0,0,0-3,9.716V35a5,5,0,0,0,3,4.576V42a2,2,0,0,0,2,2h2a2,2,0,0,0,2-2V40H34v2a2,2,0,0,0,2,2h2a2,2,0,0,0,2-2V39.576A5,5,0,0,0,43,35V25.741a5.5,5.5,0,0,0-3-9.716ZM15,6H33a5.006,5.006,0,0,1,5,5v5.213A5.506,5.506,0,0,0,34,21.5v6.309A64.945,64.945,0,0,0,24,27a64.945,64.945,0,0,0-10,.809V21.5a5.506,5.506,0,0,0-4-5.287V11A5.006,5.006,0,0,1,15,6ZM12,42H10V40h2Zm26,0H36V40h2Zm3.443-17.59a1,1,0,0,0-.443.83V35a3,3,0,0,1-3,3H10a3,3,0,0,1-3-3V25.24a1,1,0,0,0-.443-.83A3.5,3.5,0,1,1,12,21.5V29a1,1,0,0,0,.366.773.991.991,0,0,0,.83.207A62.407,62.407,0,0,1,24,29a62.407,62.407,0,0,1,10.8.98A1,1,0,0,0,36,29V21.5a3.5,3.5,0,1,1,5.443,2.91Z"/>
  </svg>,
];

function getCountdown(target: Date) {
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  if (diff < 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function HomePage() {
  const { lang, changeLang } = useLanguage();
  const t = translations[lang];
  const router = useRouter();

  // Nastavenie cieľového dátumu na 1.1.2026 00:00:00
  const [targetDate] = useState(() => {
    return new Date('2026-01-01T00:00:00');
  });
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setCountdown(getCountdown(targetDate));
    const timer = setInterval(() => setCountdown(getCountdown(targetDate)), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero sekcia */}
      <section className="relative z-20 min-h-screen w-full overflow-hidden flex flex-col">
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=cover&w=1500&q=80"
          alt="Pozadie"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/40 z-10"></div>
        <div className="relative z-20 px-4 sm:px-8 pt-6 sm:pt-8 flex justify-between items-center">
          <Logo className="h-12 w-auto pt-3 pl-3" />
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => router.push("/login")}
              className="text-white font-medium hover:underline transition"
            >
              {t.admin}
            </button>
            <label htmlFor="lang-select" className="text-white mr-1">{t.select_language}:</label>
            <select
              id="lang-select"
              value={lang}
              onChange={e => changeLang(e.target.value as Language)}
              className="bg-white/70 text-black rounded px-2 py-1"
            >
              <option value="sk">SK</option>
              <option value="cz">CZ</option>
              <option value="en">EN</option>
              <option value="es">ES</option>
            </select>
          </div>
        </div>
        <div className="relative z-20 flex flex-col justify-center min-h-[60vh] sm:h-[70vh] max-w-4xl mx-auto px-4 sm:px-8 pt-8 sm:pt-16">
          <div className="space-y-4">
            <div className="text-yellow-400 font-bold tracking-widest text-sm mb-2">{t.preparing}</div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
              {t.app_title}<br />
              <span className="font-light text-neutral-200">{t.app_subtitle}</span>
            </h1>
            <p className="text-lg sm:text-xl text-neutral-200 mb-6">
              {t.app_desc}
            </p>
            <div className="flex flex-wrap gap-4 sm:gap-8 mb-6">
              <div className="flex flex-col items-center min-w-[70px]">
                <span className="text-2xl sm:text-4xl font-bold text-white">
                  {isClient ? countdown.days : '--'}
                </span>
                <span className="text-xs sm:text-sm text-neutral-300 uppercase">{t.days}</span>
              </div>
              <div className="flex flex-col items-center min-w-[70px]">
                <span className="text-2xl sm:text-4xl font-bold text-white">
                  {isClient ? countdown.hours : '--'}
                </span>
                <span className="text-xs sm:text-sm text-neutral-300 uppercase">{t.hours}</span>
              </div>
              <div className="flex flex-col items-center min-w-[70px]">
                <span className="text-2xl sm:text-4xl font-bold text-white">
                  {isClient ? countdown.minutes : '--'}
                </span>
                <span className="text-xs sm:text-sm text-neutral-300 uppercase">{t.minutes}</span>
              </div>
              <div className="flex flex-col items-center min-w-[70px]">
                <span className="text-2xl sm:text-4xl font-bold text-white">
                  {isClient ? countdown.seconds : '--'}
                </span>
                <span className="text-xs sm:text-sm text-neutral-300 uppercase">{t.seconds}</span>
              </div>
            </div>
            <a href="/about" className="inline-block px-8 py-3 rounded-full bg-white/90 text-black font-bold text-lg shadow hover:bg-white transition">
              {t.more}
            </a>
          </div>
        </div>
      </section>
      
      {/* ---- LECTIO sekcia ---- */}
      <section className="relative z-20 bg-gray-100 min-h-screen flex flex-col justify-center py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 w-full">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-center text-[#4a5085] mb-2">
            {t.lectio_section_title}
          </h2>
          <div className="w-16 h-1 mx-auto" style={{ background: "#4a5085", borderRadius: 8, marginBottom: 32 }} />
          {/* ---- DENNÝ CITÁT (Supabase) ---- */}
          <DailyQuote />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {t.lectio_steps.map((step: LectioStep, idx: number) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: idx * 0.13 }}
                whileHover={{
                  scale: 1.06,
                  boxShadow: "0 8px 32px 0 rgba(74,80,133,0.16)",
                }}
                className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col items-center cursor-pointer transition"
              >
                {lectioIcons[idx]}
                <h3 className="font-bold text-lg sm:text-xl text-[#4a5085] mb-2 tracking-wide">{step.title}</h3>
                <p className="text-center text-gray-600 text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      <HomeNewsSection /> 
      
      <section className="py-16 sm:py-24 bg-white flex flex-col items-center justify-center w-full">
        <div className="max-w-6xl w-full mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-12 px-4">
          <div className="flex-1 w-full">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-[#4a5085] mb-4 uppercase tracking-tight">
              {t.app_section.headline}
            </h2>
            <div className="w-16 h-1 mb-8 rounded bg-[#4a5085]" />
            <p className="text-base sm:text-lg text-gray-600 mb-2">
              <span className="font-bold">{t.app_section.lead}</span>
            </p>
            <p className="text-base sm:text-lg text-gray-600 mb-2">{t.app_section.p1}</p>
            <p className="text-base sm:text-lg text-gray-600 mb-2">{t.app_section.p2}</p>
            <p className="text-base sm:text-lg text-gray-600 mb-6">{t.app_section.p3}</p>
            <p className="text-md text-[#880024] mb-4">{t.app_section.note}</p>
            <div className="flex items-center gap-4 sm:gap-6 mb-6 flex-wrap">
              <a href="https://play.google.com/store/apps/details?id=sk.dpapp.app.android604688a88a394" target="_blank" rel="noopener">
                <img src="https://play.google.com/intl/en_us/badges/static/images/badges/sk_badge_web_generic.png"
                  alt="Google Play"
                  className="h-10 sm:h-14 object-contain"
                  style={{ minWidth: 140, maxWidth: 180 }} />
              </a>
              <a href="https://apps.apple.com/sk/app/lectio-divina/id6443882687" target="_blank" rel="noopener">
                <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                  alt="App Store"
                  className="h-10 sm:h-14 object-contain"
                  style={{ minWidth: 140, maxWidth: 180, paddingTop: 4, paddingBottom: 4 }}
                />
              </a>
            </div>
            <a
              href="https://www.lectiodivina.sk"
              target="_blank"
              rel="noopener"
              className="text-[#4a5085] font-semibold underline hover:text-indigo-700"
            >
              {t.app_section.more}
            </a>
          </div>
          <div className="flex-1 flex justify-center w-full mt-8 md:mt-0">
            <img
              src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=500&q=80"
              alt={t.app_section.alt}
              className="rounded-3xl shadow-2xl w-full max-w-[410px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* Nova sekcia pre komunitu */}
      <CommunitySection translations={translations[lang]} />

    </div>
  );
}