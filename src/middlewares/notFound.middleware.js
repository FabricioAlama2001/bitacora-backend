exports.notFoundHandler = (req, res, next) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
};
