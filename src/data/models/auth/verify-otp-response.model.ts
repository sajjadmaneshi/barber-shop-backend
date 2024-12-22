import { ApiProperty } from "@nestjs/swagger";

export class VerifyOtpResponseModel {
  @ApiProperty({type:String})
  token: string;
  @ApiProperty({type:Boolean})
  isRegistered: boolean;
  constructor(

     token: string,
     isRegistered: boolean=false) {
    this.token=token;
    this.isRegistered=isRegistered;
  }
}
