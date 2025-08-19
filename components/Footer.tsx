export default function SiteFooter() {
  return (
    <footer className=" border-b mt-8">
      <div className="page flex flex-col sm:flex-row items-center justify-between py-8 text-sm text-gray-600">
        <p>
          ©{new Date().getFullYear()} Community Booking. All right reserved.
        </p>
        <div className="mt-2 sm:mt-0 flex gap-4">
          <a className="hover:underline" href="/privacy">
            Privacy
          </a>
          <a className="hover:underline" href="/terms">
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}
