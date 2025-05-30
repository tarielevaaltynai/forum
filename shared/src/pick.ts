import lodashPick from 'lodash/pick'

export const pick = <TObject extends Object, TKeys extends keyof TObject>(
  obj: TObject,
  keys: TKeys[]
): Pick<TObject, TKeys> => {
  return lodashPick(obj, keys)
}

//tobject попадает тип нашего объекта  а tkey ключи этих объектов