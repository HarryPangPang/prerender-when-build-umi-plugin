// ref:
// - https://umijs.org/plugins/api
import { IApi } from '@umijs/types';

export default function (api: IApi) {
  api.onGenerateFiles(async ({files})=>{
      console.log(files)
  })

}
