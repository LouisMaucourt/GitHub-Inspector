'use client';
import { useState, useEffect, use } from 'react';
import { useSearchParams } from 'next/navigation';
import Skeleton from '@/app/components/Skeleton';
import Link from 'next/link';



export default function RepositoryPage({ params }) {
    const { user, repository: routeRepository } = use(params)

    const [repoDetails, setRepoDetails] = useState(null);
    const [commits, setCommits] = useState(null);
    const [error, setError] = useState(null);
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !routeRepository) {
            console.error('Missing user or repository parameters.');
            return;
        }

        const username = searchParams.get("username");
        const repository = searchParams.get("repository");

        const fetchData = async () => {
            try {
                const repoDetailsRes = await fetch(`https://api.github.com/repos/${username || user}/${repository || routeRepository}`);
                const repoData = await repoDetailsRes.json();
                if (!repoDetailsRes.ok) {
                    throw new Error(`Le chargement des informations du repo n'a pas fonctionné`);
                }
                setRepoDetails(repoData);

                const commitsRes = await fetch(`https://api.github.com/repos/${username || user}/${repository || routeRepository}/commits`);
                const commitsData = await commitsRes.json();
                if (!commitsRes.ok) {
                    throw new Error(`Le chargement des commits n'a pas fonctionné`);
                }
                setCommits(commitsData);

            } catch (err) {
                setError((err).message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

    }, [searchParams, user, routeRepository]);

    return (
        <div className="max-w-xl mx-auto p-6 bg-black w-screen text-white">
            {error && <p className="text-red-500">{error}</p>}

            <div className="repo-details mb-6">
                <h2 className="text-xl mb-4">Repository Details</h2>
                {loading ? (
                    <Skeleton lines={3} height="20px" />
                ) : (
                    repoDetails && (
                        <div>
                            <h3 className="text-lg font-bold">{repoDetails.name}</h3>
                            {repoDetails.description && <p className="mt-2">Description: {repoDetails.description}</p>}
                            <Link href={repoDetails.html_url} className="text-blue-400 mt-2 inline-block">Voir son GitHub</Link>
                        </div>
                    )
                )}
            </div>
            <div className="commits">
                <h2 className="text-xl mb-4">Recent Commits</h2>
                {loading ? (
                    <Skeleton lines={5} height="16px" />
                ) : (
                    commits ? (
                        commits.length > 0 ? (
                            <ul>
                                {commits.map((commit) => (
                                    <li key={commit.sha} className="my-5 border-b pb-3">
                                        <p><strong>Commit SHA:</strong> {commit.sha}</p>
                                        <p><strong>Message:</strong> {commit.commit.message}</p>
                                        <p><strong>Auteur:</strong> {commit.commit.author.name}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>Aucun commit n&apos;a été effectué sur ce repo :/</p>
                        )
                    ) : null
                )}
            </div>
        </div>
    );
}
