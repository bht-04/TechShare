export default function HomePage() {
  return (
    <section className="relative h-[calc(100vh-120px)] mx-auto overflow-hidden bg-[#f8fbff] flex items-center justify-center">

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#dff4ff_0%,#f8fbff_45%,#f1f5f9_100%)]" />

      <div className="absolute -top-20 -left-10 sm:-top-32 sm:-left-20 w-[250px] h-[250px] sm:w-[500px] sm:h-[500px] bg-cyan-200/30 rounded-full blur-3xl" />

      <div className="absolute -bottom-20 -right-10 sm:-bottom-40 sm:-right-20 w-[250px] h-[250px] sm:w-[500px] sm:h-[500px] bg-blue-200/30 rounded-full blur-3xl" />

      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#0ea5e9_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e9_1px,transparent_1px)] bg-[size:50px_50px] sm:bg-[size:80px_80px]" />

      <div className="relative z-10 max-w-4xl text-center">

        <div className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 rounded-full border border-cyan-100 bg-white/80 backdrop-blur-xl shadow-[0_10px_40px_rgba(14,165,233,0.08)] mb-6 sm:mb-8">

          <span className="shine-text text-xs sm:text-sm font-semibold tracking-wide text-slate-700">
            TechShare Community
          </span>
        </div>

        <h1 className="font-black text-slate-900 leading-tight">

          <span className="block text-[28px] sm:text-5xl lg:text-6xl">
            Nền tảng kết nối gia sư 
          </span>

          <span className="block mt-2 sm:mt-3 text-[28px] sm:text-5xl lg:text-6xl bg-gradient-to-b from-slate-900 to-slate-700 bg-clip-text text-transparent">
            công nghệ miễn phí
          </span>

        </h1> 

        <p className="mt-6 sm:mt-8 text-base sm:text-lg lg:text-xl leading-relaxed text-slate-600 max-w-2xl mx-auto px-2">
          Hỗ trợ người lớn tuổi và vùng sâu vùng xa tiếp cận công nghệ,
          tạo ra một cộng đồng số hiện đại và dễ tiếp cận hơn.
        </p>

        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center">

          <a
            href="/RequestAssistance"
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-2xl bg-white text-black font-semibold border border-blue-400 hover:bg-blue-100 transition-all duration-300"
          >
            Tìm hỗ trợ
          </a>

          <a
            href="/volunteer-registration"
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-2xl border border-blue-400 bg-white/80 backdrop-blur-xl hover:bg-blue-100  text-slate-800 font-semibold transition-all duration-300"
          >
            Đăng ký tình nguyện viên
          </a>

        </div>
      </div>
    </section>
  );
}