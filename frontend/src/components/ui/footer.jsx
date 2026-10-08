import React from 'react'
import { Link } from 'react-router-dom'
import { Star, MapPin, Phone, Mail } from 'lucide-react'
export function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
   
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-bf-red flex items-center justify-center">
                     <img
              src="/oni.jpg"
              alt="Logo ONI"
              className="w-8 h-8 rounded-lg object-cover"
            />
              </div>
              <span className="text-lg font-bold">ONI Republique du Mali</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Direction Nationale de l'État Civil. L'institution en charge de la
              production et de la délivrance des Cartes Nationales d'Identité
              Malien.
            </p>
            <div className="text-bf-gold font-medium text-sm italic">
              "Un Peuple, Un But, Une Foi"
            </div>
          </div>

     
          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
              Services
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/demande"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Première demande
                </Link>
              </li>
              <li>
                <Link
                  to="/demande"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Renouvellement
                </Link>
              </li>
              <li>
                <Link
                  to="/demande"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Déclaration de perte
                </Link>
              </li>
              <li>
                <Link
                  to="/suivre-demande"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Suivi de dossier
                </Link>
              </li>
            </ul>
          </div>

  
          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
              Ressources
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/centres"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Centres d'enrôlement
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Pièces à fournir
                </Link>
              </li>
              <li>
                <Link
                  to="/aides"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Foire aux questions
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Textes de loi
                </Link>
              </li>
            </ul>
          </div>


          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3 text-sm text-gray-400">
                <MapPin
                  size={18}
                  className="text-bf-green flex-shrink-0 mt-0.5"
                />
                <span>
                  Bamako, Republique du Mali
                  <br />
                  Avenue de l'Indépendance
                </span>
              </li>
              <li className="flex items-center space-x-3 text-sm text-gray-400">
                <Phone size={18} className="text-bf-green flex-shrink-0" />
                <span>+223 25 30 00 00</span>
              </li>
              <li className="flex items-center space-x-3 text-sm text-gray-400">
                <Mail size={18} className="text-bf-green flex-shrink-0" />
                <span>contact@DNEC.ml</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm text-center md:text-left mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Direction Nationale de l'État Civil.
            Tous droits réservés.
          </p>
          <div className="flex space-x-6 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">
              Mentions légales
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Politique de confidentialité
            </a>
          </div>
        </div>
      </div>
   </footer>
  )
}
