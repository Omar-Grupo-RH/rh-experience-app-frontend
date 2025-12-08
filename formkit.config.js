import { generateClasses } from "@formkit/themes";

const config = {
  config: {
    classes: generateClasses({
      global: {
        wrapper: "flex flex-col gap-1",
        outer: "mb-3",
        message: "text-red-500 text-sm",
        input: "border-none bg-gray-50 rounded-lg w-full",
      },
      checkbox: {
        input: "$reset rounded-sm outline-none border-experience-blue size-5",
        wrapper: "$reset flex items-center gap-2",
      },
      submit: {
        message: "$reset text-red-500 text-sm font-bold",
        outer: "$reset ",
        input:
          "$reset bg-experience-blue text-white w-full mx-auto px-4 py-2 rounded  cursor-pointer  disabled:opacity-50",
      },
    }),
  },
};

export default config;
