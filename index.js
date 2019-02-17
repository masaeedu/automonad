const { mdo } = require("@masaeedu/do");
const {
  Obj,
  Fn,
  Fnctr,
  ReaderT,
  Reader,
  StateT,
  State
} = require("@masaeedu/fp");

const { Identity } = Fnctr;

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

// Test
{
  const App = automonad(Identity)({ r: ReaderT, s1: StateT, s2: StateT });
  const foo = M =>
    mdo(M)(({ e, s1, s2 }) => [
      // Read the environment
      [e, () => M.r(Reader.ask)],

      // Add the environment to the first state
      () => M.s1(State.modify(s1 => s1 + e)),
      // Multiply the second state by the environment
      () => M.s2(State.modify(s2 => s2 * e)),

      // Return the sum of the two states
      [s1, () => M.s1(State.get)],
      [s2, () => M.s2(State.get)],
      () => M.of(s1 + s2)
    ]);

  const e = 2;
  const s1 = 40;
  const s2 = 29;
  console.log(foo(App)(s2)(s1)(e));
  // => [[100, 58], 42]
}
