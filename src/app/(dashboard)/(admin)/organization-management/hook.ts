
const useOrganizationManagement = () => {
    
    const getOrganization = async() => {
        try {
            console.log("getOrganization")
        } catch (e) {
            throw e;
        }
    }

    return [{ getOrganization }];

}

export default useOrganizationManagement;