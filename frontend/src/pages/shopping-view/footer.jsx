import React from 'react';

const Footer = () => {
  return (
    <footer className="flex flex-col">
      {/* Top Section with fixed height */}
      <div className="h-64 text-black flex flex-col md:flex-row items-center justify-center px-6 md:px-12 bg-slate-200">
        {/* Left side - "Trade a Book" */}
        <h2 className="text-4xl md:text-7xl text-black font-inspiration mb-6 md:mb-0">
          Trade a Book
        </h2>

        {/* Centered text */}
        <p className="font-nunito text-black text-base max-w-lg text-center md:text-left md:ml-[100px]">
        Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.3.


        </p>

      </div>

      {/* Bottom Section */}
      <div className="flex justify-center items-center h-4 text-sm text-white bg-navy py-4">
        <p>© 2025 Trade a Book. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
