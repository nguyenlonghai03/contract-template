import { Search } from "lucide-react";
import SearchInput from "./SearchInput";

export default function SearchBox() {
  return (
    <form
      action="/tim-kiem"
      method="GET"
      aria-label="Tìm kiếm hợp đồng pháp lý"
      className="flex items-center bg-white rounded-full p-2 border border-slate-200 shadow-xl shadow-slate-100 transition-all hover:border-emerald-300"
    >
      <div className="pl-4 text-slate-400">
        <Search className="w-5 h-5" />
      </div>

      <SearchInput />

      <button
        type="submit"
        className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold px-6 py-2.5 rounded-full text-sm md:text-base shadow-md shadow-emerald-200 transition whitespace-nowrap shrink-0"
      >
        TÌM KIẾM
      </button>
    </form>
  );
}
