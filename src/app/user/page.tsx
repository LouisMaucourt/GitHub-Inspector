'use client';

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Skeleton from "@/app/components/Skeleton";
import Link from "next/link";

type User = {
    login: string;
    avatar_url: string;
    bio: string | null;
    blog: string | null;
};

type Repository = {
    id: number;
    name: string;
    html_url: string;
    description: string | null;
};

const PageContent = () => {
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [repos, setRepos] = useState<Repository[] | null>(null);
    const searchParams = useSearchParams();
    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {
        const param = searchParams.get("username");

        if (!param || param.trim() === "") {
            setErr("Aucun nom d'utilisateur n'a été spécifié. Veuillez fournir un nom d'utilisateur GitHub valide.");
            setLoading(false);
            return;
        }

        setUsername(param.trim());
    }, [searchParams]);

    useEffect(() => {
        if (!username) {
            return;
        }

        const fetchData = async () => {
            try {
                const userRes = await fetch(`https://api.github.com/users/${username}`);

                if (userRes.status === 404) {
                    setErr(`L'utilisateur GitHub "${username}" n'a pas été trouvé. Veuillez vérifier le nom d'utilisateur.`);
                    return;
                }

                if (!userRes.ok) throw new Error("Erreur lors de la récupération des données utilisateur.");

                const userData = await userRes.json();
                setUser(userData);

                const reposRes = await fetch(`https://api.github.com/users/${username}/repos`);
                if (!reposRes.ok) throw new Error("Erreur lors de la récupération des dépôts.");
                const reposData = await reposRes.json();
                setRepos(reposData);

                setErr(null);
            } catch (error) {
                if (error instanceof Error) {
                    setErr(error.message);
                } else {
                    setErr("Une erreur inconnue est survenue.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [username]);

    if (err) {
        return (
            <div className="max-w-xl mx-auto p-6 bg-black w-screen text-white">
                <div className="bg-red-900 p-4 rounded-lg">
                    <h2 className="text-xl font-bold text-red-300 mb-2">Erreur</h2>
                    <p className="text-red-100">{err}</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="max-w-xl mx-auto p-6 bg-black w-screen text-white">
                <div className="mb-8">
                    <Skeleton lines={1} height="100px" width="100px" />
                    <Skeleton lines={3} height="20px" width="100%" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold mb-4">Liste des dépôts</h2>
                    <Skeleton lines={5} height="30px" />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto p-6 bg-black w-screen text-white">
            <div className="mb-8">
                {user && (
                    <>
                        <Image
                            src={user.avatar_url}
                            alt={user.login}
                            width={100}
                            height={100}
                            className="rounded-full"
                        />
                        <h1 className="text-2xl font-bold mt-4">{user.login}</h1>
                        {user.bio && <p className="text-gray-600 mt-2">{user.bio}</p>}
                        {user.blog && (
                            <Link
                                href={user.blog}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline mt-4 block"
                            >
                                Visiter le site web
                            </Link>
                        )}
                    </>
                )}
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-4">Liste des dépôts</h2>
                {repos && repos.length > 0 ? (
                    <ul className="list-disc pl-5">
                        {repos.map((repo) => (
                            <li key={repo.id} className="mb-2">
                                <Link
                                    href={repo.html_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                >
                                    {repo.name}
                                </Link>
                                {repo.description && (
                                    <p className="text-gray-500 text-sm">{repo.description}</p>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div>Aucun dépôt trouvé pour cet utilisateur.</div>
                )}
            </div>
        </div>
    );
};

const Page = () => {
    return (
        <Suspense fallback={<div className="text-white">Chargement...</div>}>
            <PageContent />
        </Suspense>
    );
};

export default Page;
