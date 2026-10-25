    const { id } = useParams();
    const [entry, setEntry] = useState(null);

    useEffect(() => {
        fetch(`/api/remnants/${id}`)
            })
    }, [id]);

    }

    return (
                </select>
                        </select>
            </form>
    );
}
