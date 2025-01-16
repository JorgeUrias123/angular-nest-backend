
export const renameImage = (req, file, callBack) => {
  const name = file.originalname.split('.')[0].replace(/\s+/g, '-');
  const fileExt = file.originalname.split('.').pop();
  const randomName = Array(4)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');

  callBack(null, `${name}-${randomName}.${fileExt}`);
};

export const fileFilter = (req, file, callBack) => {

  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return callBack(new Error('Tipo de formato invalido'), false);
  }

  callBack(null, true);
}
