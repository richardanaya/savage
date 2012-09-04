define(['vows', 'assert', 'savage/model'], function (vows, assert, model) {
    vows.describe('Can use models.').addBatch({
        'Can perform various operations on tribe hierarchy tree.':{
            topic:function () {
                return {avatarId:'123', claims:[{avatarId:'abc', claims:[]}]};
            },

            'we check for existance of avatars in tribe':function (topic) {
                assert.equal(true,model.Tribe.avatarExistsInTree(topic,'123'));
                assert.equal(true,model.Tribe.avatarExistsInTree(topic,'abc'));
                assert.equal(false,model.Tribe.avatarExistsInTree(topic,'xyz'));
            },

            'we can add avatars in tribe':function (topic) {
                assert.equal(true,model.Tribe.addClaimToOwner(topic,'123','xyz'));
                assert.equal(true,model.Tribe.avatarExistsInTree(topic,'xyz'));
                assert.equal('xyz',topic.claims[1].avatarId);
                assert.equal(true,model.Tribe.addClaimToOwner(topic,'abc','qrt'));
                assert.equal(true,model.Tribe.avatarExistsInTree(topic,'qrt'));
                assert.equal('qrt',topic.claims[0].claims[0].avatarId);
            },

            'we can remove avatars in tribe':function (topic) {
                assert.equal(true,model.Tribe.avatarExistsInTree(topic,'abc'));
                assert.equal(true,model.Tribe.removeClaimFromOwner(topic, 'abc'));
                assert.equal(false,model.Tribe.avatarExistsInTree(topic,'abc'));
                assert.equal(false,model.Tribe.removeClaimFromOwner(topic,'abc'));
            }
        }
    });
});