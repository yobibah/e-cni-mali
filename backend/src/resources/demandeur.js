const DemandeurRessource = (value) => {
    if (Array.isArray(value)) {
        return value.map((item) => ({
            id: item.id,
            nud: item.nud,
            nom: item.nom,
            prenom: item.prenom,
            email: item.email,
            telephone: item.telephone,
            date_naissance: item.date_naissance
                ? new Date(item.date_naissance).toLocaleDateString("fr-FR")
                : null,
            lieux_naissance: item.lieux_naissance,
            profession: item.profession,
            genre: item.genre,
            statut: item.statut,
            role: item.roles?.map((r) => r.role.libelle).join(", ") || "",
            date_creation: item.date_creation
                ? new Date(item.date_creation).toLocaleDateString("fr-FR")
                : null,
            delete_at: item.delelet_at,
        }));
    }

    return {
        id: value.id,
        nud: value.nud,
        nom: value.nom,
        prenom: value.prenom,
        email: value.email,
        telephone: value.telephone,
        date_naissance: value.date_naissance
            ? new Date(value.date_naissance).toLocaleDateString("fr-FR")
            : null,
        lieux_naissance: value.lieux_naissance,
        profession: value.profession,
        genre: value.genre,
        statut: value.statut,
        role: value.roles?.map((r) => r.role.libelle).join(", ") || "",
        date_creation: value.date_creation
            ? new Date(value.date_creation).toLocaleDateString("fr-FR")
            : null,
        delete_at: value.delelet_at,
    };
};

module.exports = DemandeurRessource;