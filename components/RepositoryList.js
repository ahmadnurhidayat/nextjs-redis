// components/RepositoryList.js
export default function RepositoryList({ repositories }) {
  if (!repositories || repositories.length === 0) {
    return <p>No repositories found.</p>;
  }

  return (
    <div className="flex justify-center my-8">
      <table className="table-auto border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Repository Name</th>
            <th className="border border-gray-300 px-4 py-2">URL</th>
            <th className="border border-gray-300 px-4 py-2">Language</th>
            <th className="border border-gray-300 px-4 py-2">Stars</th>
          </tr>
        </thead>
        <tbody>
          {repositories.map((repo) => (
            <tr key={repo.id}>
              <td className="border border-gray-300 px-4 py-2">{repo.name}</td>
              <td className="border border-gray-300 px-4 py-2">
                <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                  {repo.html_url}
                </a>
              </td>
              <td className="border border-gray-300 px-4 py-2">{repo.language}</td>
              <td className="border border-gray-300 px-4 py-2">{repo.stargazers_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
