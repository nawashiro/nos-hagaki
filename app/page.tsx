import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <form>
        <textarea className="block rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"></textarea>
        <input
          type="submit"
          value="send"
          className="block rounded-md bg-indigo-600 text-white w-full my-3 py-1.5"
        ></input>
      </form>
    </main>
  );
}
