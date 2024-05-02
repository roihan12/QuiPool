import React from "react";
import { AppPage, actions } from "../state";
import Rocket from "../assets/rocket.png";
import { MdOutlinePoll, MdOutlineQuiz } from "react-icons/md";

const Welcome: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center h-full">
      <div className="mt-2">
        <img src={Rocket} className="w-full h-[250px]" alt="" />
      </div>
      <div className="space-y-5 max-w-4xl mx-auto text-center font-Nunito">
        <h2 className="text-4xl text-gray-800 font-extrabold mx-auto md:text-5xl">
          Yuk,
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4F46E5] to-[#E114E5]">
            {""} kita main!
          </span>
        </h2>
        <p className="max-w-2xl mx-auto ">
          Coba tunjukkan keberanianmu dengan pertanyaan yang paling seru! 🎉
        </p>
        <div className="flex items-center justify-center gap-x-10 pt-10">
          <button
            className="flex flex-row items-center rounded-lg border-2 border-b-4 border-r-4 border-violet-500 px-2 py-1 text-xl font-bold transition-all hover:-translate-y-[2px] md:block dark:border-white font-Nunito"
            onClick={() => actions.setPage(AppPage.CreateQuiz)}
          >
            <MdOutlineQuiz size={24} />
            Quiz
          </button>
          <button
            className=" flex items-center justify-center rounded-lg border-2 border-b-4 border-r-4 border-[#E114E5] px-2 py-1 text-xl font-bold transition-all hover:-translate-y-[2px] md:block dark:border-white font-Nunito"
            onClick={() => actions.setPage(AppPage.CreatePoll)}
          >
            <MdOutlinePoll size={24} />
            Poll
          </button>
        </div>
        <div className="flex items-center justify-center gap-x-60 max-sm:gap-x-2 ">
          <button className="rounded-lg border-2 border-b-4 border-r-4 border-violet-500 px-2 py-1 text-xl font-bold transition-all hover:-translate-y-[2px] md:block dark:border-white font-Nunito">
            Join Existing Quiz
          </button>
          <button
            className="rounded-lg border-2 border-b-4 border-r-4 border-[#E114E5] px-2 py-1 text-xl font-bold transition-all hover:-translate-y-[2px] md:block dark:border-white font-Nunito"
            onClick={() => actions.setPage(AppPage.JoinPoll)}
          >
            Join Existing Poll
          </button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
