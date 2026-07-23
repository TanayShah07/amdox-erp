import {
  Bell,
  Search,
  UserCircle
} from "lucide-react";


export default function Navbar(){

  const role =
    localStorage.getItem("role") || "employee";


  return (

    <header
      className="
      h-20
      bg-white
      rounded-2xl
      shadow-sm
      flex
      items-center
      justify-between
      px-6
      mb-6
      "
    >


      {/* Search */}

      <div
        className="
        flex
        items-center
        gap-3
        bg-gray-100
        px-4
        py-2
        rounded-xl
        w-96
        "
      >

        <Search
          size={20}
          className="text-gray-500"
        />

        <input
          placeholder="Search ERP..."
          className="
          bg-transparent
          outline-none
          w-full
          "
        />

      </div>



      {/* Right Side */}

      <div
        className="
        flex
        items-center
        gap-6
        "
      >


        <button
          className="
          relative
          "
        >

          <Bell
            size={24}
          />

          <span
            className="
            absolute
            -top-1
            -right-1
            bg-red-500
            text-white
            text-xs
            rounded-full
            w-4
            h-4
            flex
            items-center
            justify-center
            "
          >
            3
          </span>

        </button>



        <div
          className="
          flex
          items-center
          gap-3
          "
        >

          <UserCircle
            size={38}
          />

          <div>

            <p
              className="
              font-semibold
              capitalize
              "
            >
              {role}
            </p>

            <p
              className="
              text-xs
              text-gray-500
              "
            >
              Account
            </p>

          </div>


        </div>


      </div>


    </header>

  );
}