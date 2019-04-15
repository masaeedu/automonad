const { Obj, Fn } = require("@masaeedu/fp");

const automonad = base => {
  const rec = nat => monad => elevator =>
    Obj.match({
      Empty: { ...monad, ...nat },
      With: k => t => {
        const monad_ = t(monad);
        const nat_ = {
          ...Obj.map(Fn.compose(monad_.lift))(nat),
          [k]: t(base).mmap(elevator)
        };

        return rec(nat_)(monad_)(Fn.compose(monad_.lift)(elevator));
      }
    });

  return rec({})(base)(Fn.id);
};

module.exports = { automonad };
