export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="mt-8 text-center text-sm text-gray-400">
      <div className="h-[4px] bg-gradient-to-r from-[#1A1A2E] via-[#1A1A2E] to-transparent bg-[size:8px_4px] mb-4"></div>
      <p>© {currentYear} RetroDailyChallenge - A new arcade game every day!</p>
      <div className="mt-2 flex justify-center space-x-4">
        <a href="#" className="hover:text-[#FFD166] transition">About</a>
        <a href="#" className="hover:text-[#FFD166] transition">Privacy</a>
        <a href="#" className="hover:text-[#FFD166] transition">Terms</a>
        <a href="#" className="hover:text-[#FFD166] transition">Contact</a>
      </div>
    </footer>
  );
}
