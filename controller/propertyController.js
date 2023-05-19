
const admin = (req, res) => {
    res.render('properties/admin', {
        page: 'My Properties',
        bar: true,
    })
};

const create = (req, res) => {
    res.render('properties/create', {
        page: 'Publish a new property',
        bar: true,
    })
};

export {
    admin,
    create,
};