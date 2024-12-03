import {useHashParam} from "@metapages/hash-query";

export const useIsReadOnly = () => {
	const [readOnlyParam] = useHashParam("readonly", undefined);
	return readOnlyParam !== undefined;
}