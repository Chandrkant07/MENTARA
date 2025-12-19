import React from 'react';
import { Link } from 'react-router-dom';

export default function MarketingFooter() {
  return (
    <footer className="mt-20 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="text-xl font-bold text-white">Mentara</div>
            <p className="text-gray-400 mt-3 max-w-xl">
              A premium exam practice platform for students, teachers, and admins —
              designed to feel effortless and look world-class.
            </p>
            <p className="text-xs text-gray-500 mt-6">
              © {new Date().getFullYear()} Mentara. All rights reserved.
            </p>
          </div>

          <div>
            <div className="text-sm font-semibold text-white">Pages</div>
            <div className="mt-4 grid gap-2 text-sm">
              <Link className="text-gray-400 hover:text-white" to="/about">About</Link>
              <Link className="text-gray-400 hover:text-white" to="/courses">Courses</Link>
              <Link className="text-gray-400 hover:text-white" to="/results">Result</Link>
              <Link className="text-gray-400 hover:text-white" to="/contact">Contact</Link>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-white">Get Started</div>
            <div className="mt-4 grid gap-2 text-sm">
              <Link className="text-gray-400 hover:text-white" to="/join">Join Now</Link>
              <Link className="text-gray-400 hover:text-white" to="/login">Login</Link>
              <Link className="text-gray-400 hover:text-white" to="/signup">Create account</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
