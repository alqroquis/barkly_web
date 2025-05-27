import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Container, Spinner } from 'react-bootstrap';

const ArticlePage = () => {
    const { categorySlug, articleSlug } = useParams();
    const [article, setArticle] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/articles/${categorySlug}/${articleSlug}`);

                if (!response.ok) {
                    throw new Error('Статья не найдена');
                }

                const data = await response.json();
                setArticle(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchArticle();
    }, [categorySlug, articleSlug]);

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
                <Spinner animation="border" style={{ color: '#8AA65B' }} />
            </div>
        );
    }

    if (error) {
        return (
            <Container className="py-5 text-center">
                <h3 style={{ color: '#e74c3c' }}>{error}</h3>
                <Link to="/" className="btn mt-3" style={{
                    backgroundColor: '#8AA65B',
                    color: 'white',
                    borderRadius: '20px',
                    padding: '10px 20px'
                }}>
                    Вернуться на главную
                </Link>
            </Container>
        );
    }

    if (!article) return null;

    return (
        <div className="article-page mt-100">
            <Container className="py-5">

                <nav aria-label="breadcrumb" className="mb-4">
                    <ol className="breadcrumb" style={{ backgroundColor: 'transparent', padding: 0 }}>
                        <li className="breadcrumb-item">
                            <Link to="/" style={{ color: '#8AA65B' }}>Главная</Link>
                        </li>
                        <li className="breadcrumb-item active" aria-current="page">
                            {article.title}
                        </li>
                    </ol>
                </nav>


                <div className="mb-4">
                    <span className="badge mb-2" style={{
                        backgroundColor: '#e8f1e1',
                        color: '#8AA65B',
                        padding: '6px 12px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: 600
                    }}>
                        {article.categoryName}
                    </span>
                    <h1 style={{
                        fontWeight: 700,
                        color: '#2c3e50',
                        marginBottom: '20px'
                    }}>
                        {article.title}
                    </h1>
                    <div className="d-flex align-items-center" style={{ color: '#7f8c8d', fontSize: '14px' }}>
                        <span className="me-3">{new Date(article.createdAt).toLocaleDateString('ru-RU')}</span>
                        <span>Автор: {article.authorName}</span>
                    </div>
                </div>


                {article.imageUrl && (
                    <div className="mb-5" style={{
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.08)'
                    }}>
                        <img
                            src={article.imageUrl}
                            alt={article.title}
                            className="img-fluid w-100"
                            style={{ display: 'block' }}
                        />
                    </div>
                )}


                <div className="article-content" style={{
                    fontSize: '16px',
                    lineHeight: '1.8',
                    color: '#2c3e50'
                }}>
                    {article.content.split('\n').map((paragraph, i) => (
                        <p key={i} className="mb-4" style={{ textAlign: 'justify' }}>
                            {paragraph}
                        </p>
                    ))}
                </div>
            </Container>


            <style jsx global>{`
                .breadcrumb-item + .breadcrumb-item::before {
                    content: "›";
                    color: #8AA65B;
                    font-size: 1.2rem;
                    vertical-align: middle;
                }
                
                .btn:hover {
                    background-color: #6d8a4a !important;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                }
            `}</style>
        </div>
    );
};

export default ArticlePage;