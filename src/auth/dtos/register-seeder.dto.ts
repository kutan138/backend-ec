import { Role } from 'src/roles/entities/role.entity';
import { RegisterDto } from './register.dto';

export class RegisterSeederDto extends RegisterDto {
  roles: Role[];
}
