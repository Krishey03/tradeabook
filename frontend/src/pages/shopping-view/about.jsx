function ShoppingAbout() {
    return (
      <div className="min-h-screen bg-white px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">
            About Trade a Book
          </h1>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            <strong>Trade a Book</strong> is a community-driven platform where users can buy, sell, or exchange books with one another. Our goal is to make book trading easier, more secure, and environmentally friendly.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Whether you have textbooks from previous semesters or novels you'd like to pass on, our platform helps you connect with people looking for those exact titles. 
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            We offer features like:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
            <li>Secure book exchange using an escrow system</li>
            <li>Bidding system for competitive pricing</li>
            <li>Book exchange offers with detailed book info</li>
            <li>Chat with sellers or buyers for better communication</li>
            <li>Simple and clean user interface</li>
          </ul>
          <p className="text-lg text-gray-700 leading-relaxed">
            We believe that every book deserves a second life — let's trade knowledge and stories together.
          </p>
        </div>
      </div>
    );
  }
  
  export default ShoppingAbout;
  