import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";

@Injectable()
export class RoleGuard implements CanActivate {

    constructor(
        private readonly reflectorService: Reflector
    ) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const requiredRoles = this.reflectorService.get<string[]>("roles", context.getHandler());

        if(!requiredRoles || requiredRoles.length === 0) {
            return true; // no RBA needed
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user; // set by the jwt auth guard

        if(!user) {
            return false;
        }

        return requiredRoles.includes(user.role);
    }
}