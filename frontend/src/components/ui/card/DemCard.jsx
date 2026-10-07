const DemanCard = ({ item }) => {
  const Icon = item.icon;
  
  // Fonction pour obtenir la couleur dark correspondante
  const getDarkColor = (colorClass) => {
    const colorMap = {
      'text-green-500': 'dark:text-green-400',
      'text-red-500': 'dark:text-red-400',
      'text-green-500': 'dark:text-green-400',
      'text-yellow-500': 'dark:text-yellow-400',
      'text-lime-500': 'dark:text-lime-400',
      'text-amber-500': 'dark:text-amber-400',
      'text-orange-500': 'dark:text-orange-400',
      'text-purple-500': 'dark:text-purple-400',
      'text-pink-500': 'dark:text-pink-400',
      'text-indigo-500': 'dark:text-indigo-400',
      'text-gray-500': 'dark:text-gray-400',
      'text-gray-600': 'dark:text-gray-400',
      'text-gray-700': 'dark:text-gray-300',
      'text-gray-800': 'dark:text-gray-200',
    };
    return colorMap[colorClass] || 'dark:text-gray-400';
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md border border-gray-200 dark:border-gray-700">
      <div className="flex flex-row gap-2 mb-4">
        <div
          className={`${item.bg} dark:bg-opacity-20 rounded-lg p-3 shrink-0 justify-center items-center`}
        >
          <Icon size={18} className={`${item.color} ${getDarkColor(item.color)}`} />
        </div>

        <div className="min-w-0">
          <p className="text-gray-400 dark:text-gray-500 text-xs font-medium truncate">
            {item.titre}
          </p>
          <h2 className="font-bold text-xl text-gray-800 dark:text-gray-100 mt-0.5">
            {item.value}
          </h2>
        </div>
      </div>
    </div>
  );
}; 

export default DemanCard;