import React from "react";
import { IoMdStarOutline } from "react-icons/io";


function reviews() {

  const reviews = [
    "Lorem ipsum dolor sit amet consectetur. Nunc eget aliquam sagittis adipiscing diam dictum ut molestie.",
    "Lorem ipsum dolor sit amet consectetur. Nunc eget aliquam sagittis adipiscing diam dictum ut molestie.",
    "Lorem ipsum dolor sit amet consectetur. Nunc eget aliquam sagittis adipiscing diam dictum ut molestie.",
    "Lorem ipsum dolor sit amet consectetur. Nunc eget aliquam sagittis adipiscing diam dictum ut molestie.",
    "Lorem ipsum dolor sit amet consectetur. Nunc eget aliquam sagittis adipiscing diam dictum ut molestie.",
    "Lorem ipsum dolor sit amet consectetur. Nunc eget aliquam sagittis adipiscing diam dictum ut molestie.",
  ];

  return (
    <div className="m-10">
      <h1 className="text-lg sm:text-xl md:text-2xl my-5 text-black font-semibold">Reviews</h1>
      <div className="bg-white border border-custom-lightGrayColor w-full md:h-[70px] rounded-[10px] md:py-0 py-5">
        <div className="md:grid md:grid-cols-10 grid-cols-1 w-full h-full ">
          <div className="cursor-pointer flex md:justify-center justify-start items-center md:border-r md:border-r-custom-lightGrayColor md:px-0 px-5">
            <img className="w-[20px] h-[23px]" src="/filterImg.png" />
          </div>
          <div className="flex md:justify-center justify-start items-center md:border-r md:border-r-custom-lightGrayColor md:px-0 px-5 md:pt-0 pt-5 md:pb-0 pb-3">
            <p className="text-custom-black text-sm	font-bold">Filter By</p>
          </div>
          <div className="col-span-8 flex justify-start items-center ">
            <p className="text-custom-black font-semibold text-sm pl-3">Date</p>
            <input
              className="px-5 border ml-3 text-custom-black"
              type="date"
              placeholder="Date"
            />
          </div>
        </div>
      </div>

      <div className="overflow-y-scroll max-h-[400px] md:max-h-[500px] mt-5 scrollbar-hide md:pb-10 pb-5">
        {reviews.map((review, index) => (
          <div key={index} className="mb-5">
            <div className="flex justify-between items-center mb-3 md:w-[90%] w-full">
              <p className="text-sm text-custom-darkGreen font-semibold">
                4 Hours ago
              </p>
              <div className="flex">
                {Array(5)
                  .fill(0)
                  .map((_, starIndex) => (
                    <IoMdStarOutline
                      key={starIndex}
                      className="text-custom-darkGray text-lg"
                    />
                  ))}
              </div>
            </div>

            <div className="border w-full md:w-[90%] border-t-8 border-t-custom-lightpurple rounded-md py-5 px-5">
              <p className="text-black">{review}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default reviews;
